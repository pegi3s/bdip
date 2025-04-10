import { HttpClient, httpResource } from "@angular/common/http";
import { computed, Injectable, Resource, Signal, WritableResource } from "@angular/core";
import { concatMap, Observable, of } from "rxjs";
import { catchError, map, shareReplay } from 'rxjs/operators';

import { Ontology } from '../obo/Ontology';
import { DockerHubImage } from '../models/docker-hub-image';
import { DockerHubTag } from '../models/docker-hub-tag';
import { githubInfo } from '../core/constants/github-info';
import { ImageMetadata } from '../models/image-metadata';
import { environment } from "../../environments/environment";
import { rxResource } from "@angular/core/rxjs-interop";
import { TermStanza } from "../obo/TermStanza";

@Injectable({
  providedIn: 'root',
})
export class ContainerService {
  private readonly baseMetadataURL = `https://raw.githubusercontent.com/${githubInfo.owner}/${githubInfo.repository}/${githubInfo.branch}/metadata/`;
  private readonly urlObo = `${this.baseMetadataURL}/dio.obo`;
  private readonly urlDiaf = `${this.baseMetadataURL}/dio.diaf`;
  private readonly urlJson = `${this.baseMetadataURL}/metadata.json`;
  //private baseURLDockerHub = 'https://hub.docker.com/v2/namespaces/pegi3s/repositories';
  private readonly proxyServerURL = environment.proxyServerURL;
  private readonly baseDockerHubEndpoint = '/v2/namespaces/pegi3s/repositories';

  private ontologyCache?: Observable<Ontology>;

  constructor(private http: HttpClient) {
  }

  /* ----- Resources ---- */

  /** Fetches the raw ontology, transforms it into an Ontology instance */
  private readonly ontology = httpResource.text<Ontology>(
    () => this.urlObo,
    { parse: (response: string) => new Ontology(response) }
  );

  /**
   * Fetches the raw DIAF file that contains the categories and their corresponding containers.
   * The data is expected to be in a text format where each line represents a key-value pair,
   * separated by a tab character.
   * Then, it's parsed into a Map where:
   * - The key is the category of the ontology
   * - The value is a Set of the names of the containers that belong to that category
   */
  private readonly containers = httpResource.text<Map<string, Set<string>>>(
    () => this.urlDiaf,
    {
      parse: (response: string) => this.parseContainers(response),
      defaultValue: new Map<string, Set<string>>()
    }
  );

  /**
   * Fetches the metadata of all containers from a JSON file.*
   * The metadata is parsed into a Map where:
   * - The key is the name of the container
   * - The value is the metadata of the container
   *
   * This Map is used to store the metadata of all containers.
   */
  private readonly containersMetadata = httpResource<Map<string, ImageMetadata>>(
    () => this.urlJson,
    {
      parse: (response) => {
        const map = new Map<string, ImageMetadata>();
        (response as ImageMetadata[]).forEach((item) => {
          if (map.has(item.name)) {
            console.error(`Duplicate container name found: ${item.name}`);
          } else {
            map.set(item.name, item);
          }
        });
        return map;
      },
      defaultValue: new Map<string, ImageMetadata>()
    }
  );

  /**
   * Retrieves the information stored in Docker Hub for all containers.
   * @returns A Map where the key is the container's name and the value is its Docker Hub information.
   */
  containersInfo = rxResource({
    loader: () => {
      const url = new URL(`${this.baseDockerHubEndpoint}?page=1&page_size=100`, this.proxyServerURL).toString();
      return this.fetchAllPagesContainersInfo(url, []).pipe(
        map(allResults => {
          const imageMap = new Map<string, DockerHubImage>();
          allResults.forEach(image => {
            if (image.name) {
              imageMap.set(image.name, image);
            }
          });
          return imageMap;
        }),
        catchError(err => {
          console.error('Error fetching DockerHub images:', err);
          return of(new Map<string, DockerHubImage>());
        })
      );
    },
    defaultValue: new Map<string, DockerHubImage>(),
  });

  /** A map to store the tags of each container */
  private readonly containersTags: Map<string, WritableResource<DockerHubTag[]>> = new Map<string, WritableResource<DockerHubTag[]>>();

  getOntologyRes(): Resource<Ontology | undefined> {
    return this.ontology.asReadonly();
  }

  getContainersMapRes(): Resource<Map<string, Set<string>>> {
    return this.containers.asReadonly();
  }

  getContainerCategoryHierarchy(name: string): Signal<TermStanza[][]> {
    return computed(() => {
      const ontology = this.ontology.value();
      const containerMap = this.containers.value();
      const categoryIds = Array.from(containerMap.keys()).filter((category) => containerMap.get(category)?.has(name));
      const categoryHierarchy: TermStanza[][] = [];
      categoryIds.forEach((categoryId) => {
        const category = ontology?.findTermById(categoryId);
        const hierarchy = [];
        if (category) {
          hierarchy.push(category);
          let parent = category.getParents()[0];
          while (parent) {
            hierarchy.unshift(parent);
            parent = parent.getParents()[0];
          }
          categoryHierarchy.push(hierarchy);
        }
      });
      return categoryHierarchy;
    });
  }

  /** Retrieves the metadata for all containers */
  getAllContainersMetadataRes(): Resource<Map<string, ImageMetadata>> {
    return this.containersMetadata.asReadonly();
  }

  /** Retrieves the metadata for the specified container */
  getContainerMetadataRes(name: string): Signal<ImageMetadata | undefined> {
    return computed(() => this.containersMetadata.value()?.get(name));
  }

  /** Retrieves the information for all containers from Docker Hub */
  getAllContainersInfoRes(): Resource<Map<string, DockerHubImage>> {
    return this.containersInfo.asReadonly();
  }

  /** Fetches information about a specific container from Docker Hub */
  getContainerInfoRes(name: string) {
    return httpResource<DockerHubImage>(() => new URL(`${this.baseDockerHubEndpoint}/${name}`, this.proxyServerURL).toString());
  }

  /**
   * Fetches information about the tags of a specific container from Docker Hub
   * @param {string} name - The name of the Docker container.
   */
  getContainerTagsRes(name: string): Resource<DockerHubTag[]> {
    if (!this.containersTags.has(name)) {
      const url = new URL(`${this.baseDockerHubEndpoint}/${name}/tags?page_size=100`, this.proxyServerURL).toString();
      const tagsRes = rxResource({
        loader: () => this.fetchAllPagesTags(url, []).pipe(
          map((tags) => tags),
          catchError(err => {
            console.error('Error fetching DockerHub tags:', err);
            return of([]); // Return an empty array if error
          })
        ),
        defaultValue: [],
      });
      this.containersTags.set(name, tagsRes);
    }
    return this.containersTags.get(name)!.asReadonly();
  }

  /* ----- Paging ---- */

  /**
   * Recursively fetches all pages of containers from Docker Hub.
   *
   * @param url The URL of the current page to fetch.
   * @param allResults The array to store all the results from all pages.
   */
  private fetchAllPagesContainersInfo(url: string, allResults: DockerHubImage[]): Observable<DockerHubImage[]> {
    return this.http.get<{ next: string, results: DockerHubImage[] }>(url).pipe(
      catchError(err => {
        console.error('Error fetching DockerHub images:', err);
        return of({ next: null, results: [] }); // Return an empty page if error
      }),
      map(response => {
        // Push the current page's results to the allResults array
        allResults.push(...response.results);

        // If there is a next page, continue to fetch the next page
        if (response.next) {
          const indexEndpoint = response.next.indexOf('/v2');
          const nextURL = new URL(response.next.substring(indexEndpoint), this.proxyServerURL).toString();
          return this.fetchAllPagesContainersInfo(nextURL, allResults);
        } else {
          // Return the final results once all pages have been fetched
          return of(allResults);
        }
      }),
      concatMap((finalResults) => finalResults),
    );
  }

  private fetchAllPagesTags(url: string, allResults: DockerHubTag[]): Observable<DockerHubTag[]> {
    return this.http.get<{ next: string, results: DockerHubTag[] }>(url).pipe(
      catchError(err => {
        console.error('Error fetching DockerHub tags:', err);
        return of({ next: null, results: [] }); // Return an empty page if error
      }),
      map(response => {
        // Push the current page's results to the allResults array
        allResults.push(...response.results);

        // If there is a next page, continue to fetch the next page
        if (response.next) {
          const indexEndpoint = response.next.indexOf('/v2');
          const nextURL = new URL(response.next.substring(indexEndpoint), this.proxyServerURL).toString();
          return this.fetchAllPagesTags(nextURL, allResults);
        } else {
          // Return the final results once all pages have been fetched
          return of(allResults);
        }
      }),
      concatMap((finalResults) => finalResults),
    );
  }

  /* ----- Parsers ---- */

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

  /* ----- Observables ---- */

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
  getContainerTags(name: string): Observable<DockerHubTag[]> {
    const url = new URL(`${this.baseDockerHubEndpoint}/${name}/tags?page_size=100`, this.proxyServerURL).toString();
    return this.fetchAllPagesTags(url, []).pipe(
      map((tags) => tags),
      catchError(err => {
        console.error('Error fetching DockerHub tags:', err);
        return of([]); // Return an empty array if error
      })
    );
  }
}
