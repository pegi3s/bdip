import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';

import { Ontology } from '../obo/Ontology';
import { DockerHubImage } from '../models/docker-hub-image';
import { DockerHubTag } from '../models/docker-hub-tag';
import { githubInfo } from '../core/constants/github-info';
import { ImageMetadata } from '../models/image-metadata';

@Injectable({
  providedIn: 'root',
})
export class ContainerService {
  private readonly baseMetadataURL = `https://raw.githubusercontent.com/${githubInfo.owner}/${githubInfo.repository}/master/metadata/`;
  private readonly urlObo = `${this.baseMetadataURL}/dio.obo`;
  private readonly urlDiaf = `${this.baseMetadataURL}/dio.diaf`;
  //private readonly urlJson = `${this.baseMetadataURL}/metadata.json`;
  private readonly urlJson = `assets/metadata.json`;
  //private baseURLDockerHub = 'https://hub.docker.com/v2/namespaces/pegi3s/repositories';
  private readonly proxyServerURL = `http://${window.location.hostname}:8080/`;
  private readonly baseDockerHubEndpoint = '/v2/namespaces/pegi3s/repositories';

  private ontologyCache?: Observable<Ontology>;
  private containersCache?: Observable<Map<string, Set<string>>>;
  private containersMetadataSubject: ReplaySubject<Map<string, ImageMetadata>> = new ReplaySubject(1);
  private containersMetadata$: Observable<Map<string, ImageMetadata>> = this.containersMetadataSubject.asObservable();

  constructor(private http: HttpClient) {
    this.getContainersMetadata();
  }

  /**
   * Fetch the OBO file that contains the ontology.
   *
   * @returns {Observable<string>} The raw data from the OBO file.
   */
  private getRawOntology(): Observable<string> {
    return this.http.get(this.urlObo, { responseType: 'text' });
  }

  /**
   * Retrieves the ontology. If the ontology is cached and the `cached` parameter is `true`,
   * it returns the cached version. Otherwise, it fetches the raw ontology, transforms it
   * into an Ontology instance, caches it (if `cached` is `true`), and then returns it.
   *
   * The returned Observable is shared among multiple subscribers to avoid redundant
   * network requests. The last emitted value is replayed to new subscribers.
   *
   * Note: The cached Ontology instance that the subscribers receive always points to the same instance.
   *
   * @param {boolean} cached - If `true`, use the cached ontology if available. If `false`, fetch a new ontology.
   * @returns {Observable<Ontology>} An Observable that emits the ontology.
   */
  getOntology(cached: boolean = true): Observable<Ontology> {
    if (!cached) {
      return this.getRawOntology().pipe(map((data) => new Ontology(data)));
    }

    if (this.ontologyCache) {
      return this.ontologyCache;
    }

    this.ontologyCache = this.getRawOntology().pipe(
      map((data) => new Ontology(data)),
      shareReplay(1),
    );

    return this.ontologyCache;
  }

  /**
   * Fetch the DIAF file that contains the categories and their corresponding containers.
   * The data is expected to be in a text format where each line represents a key-value pair,
   * separated by a tab character.
   *
   * @returns {Observable<string>} The raw data from the DIAF file.
   */
  private getRawContainers(): Observable<string> {
    return this.http.get(this.urlDiaf, { responseType: 'text' });
  }

  /**
   * Parse the raw data from the DIAF file into a Map object where the key is the category
   * and the value is a Set of containers.
   *
   * @param {string} data The raw data from the DIAF file.
   * @returns {Map<string, Set<string>>} A Map object where the key is the category and the value is a Set of containers.
   */
  private parseContainers(data: string): Map<string, Set<string>> {
    const containers = new Map<string, Set<string>>();

    data.split('\n').forEach((element) => {
      if (!element) return;

      const [key, value] = element.split('\t');
      if (!containers.has(key)) {
        containers.set(key, new Set([value]));
      } else {
        containers.get(key)?.add(value);
      }
    });
    return containers;
  }

  /**
   * Retrieve a Map where:
   * - The key is the category of the ontology
   * - The value is a Set of the names of the containers that belong to that category
   *
   * If the request has already been made, the cached version is returned.
   *
   * The returned Observable is shared among multiple subscribers to avoid redundant
   * network requests. The last emitted value is replayed to new subscribers.
   *
   * @returns {Observable<Map<string, Set<string>>>} A Map object where the key is the category and the value is a Set of containers.
   */
  getContainersMap(): Observable<Map<string, Set<string>>> {
    if (this.containersCache) {
      return this.containersCache;
    }

    this.containersCache = this.getRawContainers().pipe(
      map(this.parseContainers),
      shareReplay(1),
    );

    return this.containersCache;
  }

  /**
   * Retrieve an array with the name of all the containers.
   *
   * @returns {Observable<string[]>} An Observable of an array of distinct container names.
   */
  getAllContainers(): Observable<string[]> {
    return this.getContainersMap().pipe(
      map((containers) => {
        let containersDistinct = new Set<string>();
        containers.forEach((value) => {
          value.forEach((container) => {
            containersDistinct.add(container);
          });
        });
        return Array.from(containersDistinct);
      }),
    );
  }

  /**
   * Fetches and processes container metadata from a specified URL.
   * 
   * This method retrieves an array of `ImageMetadata` objects from the specified `urlJson`.
   * It then processes this array to create a `Map` where each key is the container's name and the value is its metadata.
   * The resulting `Map` is then emitted through `containersMetadataSubject`.
   * In case of an error during the fetching process, it logs the error and returns an empty array.
   */
  private getContainersMetadata(): void {
    this.http.get<ImageMetadata[]>(this.urlJson).pipe(
      map(data => {
        const map = new Map<string, ImageMetadata>();
        data.forEach((item) => {
          if (map.has(item.name)) {
            console.error(`Duplicate container name found: ${item.name}`);
          } else {
            map.set(item.name, item);
          }
        });
        return map;
      }),
      tap(data => this.containersMetadataSubject.next(data)),
      catchError(error => {
        console.error('Error loading tutorials:', error);
        return [];
      })
    ).subscribe();
  }

  /**
   * Retrieves the metadata for the specified container.
   * 
   * @param {string} name The name of the container to retrieve metadata for.
   * @returns {Observable<ImageMetadata | undefined>} An Observable that emits the metadata of the specified container if found, otherwise undefined.
   */
  getContainerMetadata(name: string): Observable<ImageMetadata | undefined> {
    return this.containersMetadata$.pipe(
      map(containers => containers.get(name)),
    );
  }

  /**
   * Fetches information about a specific container from Docker Hub.
   *
   * @param {string} name - The name of the Docker container.
   * @returns {Observable<DockerHubImage>} An Observable that will emit the Docker container information.
   */
  getContainerInfo(name: string): Observable<DockerHubImage> {
    return this.http.get<DockerHubImage>(
      new URL(`${this.baseDockerHubEndpoint}/${name}`, this.proxyServerURL).toString(),
    );
  }

  /**
   * Fetches information about the tags of a specific container from Docker Hub.
   *
   * @param {string} name - The name of the Docker container.
   * @returns {Observable<DockerHubImage>} An Observable that will emit the information about the tags of the Docker container.
   */
  getContainerTags(name: string, page: number = 1): Observable<DockerHubTag[]> {
    return this.http.get<{ results: DockerHubTag[]; }>(
      new URL(`${this.baseDockerHubEndpoint}/${name}/tags?page=${page}`, this.proxyServerURL).toString(),
    )
    .pipe(map((response) => response.results));
  }
}
