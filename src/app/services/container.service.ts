import { HttpClient, httpResource } from "@angular/common/http";
import { computed, inject, Resource, Service, Signal, signal, WritableResource } from "@angular/core";
import { concatMap, filter, Observable, of, retry, shareReplay, take, throwError, timer, from, mergeMap, toArray } from "rxjs";
import { catchError, map } from "rxjs/operators";

import { Ontology } from '../obo/Ontology';
import { DockerHubImage } from '../models/docker-hub-image';
import { DockerHubTag } from '../models/docker-hub-tag';
import { githubInfo } from '../core/constants/github-info';
import { ImageMetadata } from '../models/image-metadata';
import { environment } from "../../environments/environment";
import { rxResource } from "@angular/core/rxjs-interop";
import { TermStanza } from "../obo/TermStanza";
import { RelatedSoftware } from '../models/related-software';

@Service()
export class ContainerService {
  private readonly http = inject(HttpClient);

  private readonly baseMetadataURL = `https://raw.githubusercontent.com/${githubInfo.owner}/${githubInfo.repository}/${githubInfo.branch}/metadata/`;
  private readonly urlObo = `${this.baseMetadataURL}/dio.obo`;
  private readonly urlDiaf = `${this.baseMetadataURL}/dio.diaf`;
  private readonly urlJson = `${this.baseMetadataURL}/metadata.json`;
  private readonly urlRelatedSoftware = `${this.baseMetadataURL}/related-software.json`;
  //private baseURLDockerHub = 'https://hub.docker.com/v2/namespaces/pegi3s/repositories';
  private readonly proxyServerURL = environment.proxyServerURL;
  private readonly baseDockerHubEndpoint = '/v2/namespaces/pegi3s/repositories';

  private ontologyCache?: Observable<Ontology>;

  private readonly _readmesEnabled = signal<boolean>(false);

  enableReadmes(): void {
    this._readmesEnabled.set(true);
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
   *
   * Docker Hub caps pagination for anonymous requests once the offset gets
   * large enough — past that point every further page returns
   * {"message": "pagination offset too large for anonymous requests; sign in to page further"}
   * instead of data. Changing page_size doesn't avoid it, since the cap is on
   * the cumulative item offset, not the page number.
   *
   * `fetchAllPages` already treats that response as "no more pages" and just
   * returns whatever was collected so far, so this resource silently ends up
   * with a partial (but not empty) list rather than failing outright.
   *
   * Since we can't reliably walk the entire repository list anonymously, we
   * request `ordering=last_updated` — Docker Hub's ordering param is
   * descending here, so this is newest-first — meaning the partial set we do
   * get back is the most recently updated images, which is exactly what this
   * resource is used for (surfacing image dates), rather than an arbitrary
   * slice.
   *
   * @returns A Map where the key is the container's name and the value is its Docker Hub information.
   */
  containersInfo = rxResource({
    stream: () => {
      const url = new URL(`${this.baseDockerHubEndpoint}?page=1&page_size=99&ordering=last_updated`, this.proxyServerURL).toString();
      return this.fetchAllPages<DockerHubImage>(url, [], 'DockerHub images').pipe(
        map(allResults => {
          const imageMap = new Map<string, DockerHubImage>();
          allResults.forEach(image => {
            if (image.name) {
              imageMap.set(image.name, image);
            }
          });
          return imageMap;
        }),
      );
    },
    defaultValue: new Map<string, DockerHubImage>(),
  });

  /** A map to store the tags of each container */
  private readonly containersTags: Map<string, WritableResource<DockerHubTag[]>> = new Map<string, WritableResource<DockerHubTag[]>>();

  /** Global related software dataset */
  private readonly relatedSoftwareRes = httpResource<RelatedSoftware | null>(
    () => this.urlRelatedSoftware,
    {
      defaultValue: null,
      parse: (response) => response as RelatedSoftware
    }
  );

  /** A map to store the READMEs of each container */
  containersReadmes = rxResource({
    params: () => {
      if (!this._readmesEnabled()) return undefined;
      return this.containersMetadata.value();
    },
    stream: ({ params: metadata }) => {
      const containers = metadata ? Array.from(metadata.keys()) : [];

      const createReadmeObservable = (container: string) => {
        const url = new URL(`${this.baseDockerHubEndpoint}/${container}`, this.proxyServerURL).toString();
        return this.http.get<DockerHubImage>(url).pipe(
          retry({
            count: Infinity, // Retry indefinitely for 429 errors
            delay: (error, retryCount) => {
              if (error.status === 429) { // Too Many Requests
                // Implement exponential backoff with jitter to avoid thundering herd
                const baseDelay = 10000; // Start with 10 seconds
                const maxDelay = 40000; // Cap at 40 seconds
                const exponentialDelay = Math.min(baseDelay * Math.pow(1.5, retryCount - 1), maxDelay);
                const jitter = Math.random() * 1000; // Add up to 1 second of jitter
                const delayMs = exponentialDelay + jitter;

                // Log all available headers for debugging
                console.log("Rate limit error headers:", error.headers);
                // TODO: Replace the wait time with the contents of the Retry-After header

                console.warn(
                  `Container '${container}': API rate limit (429). Retrying with exponential backoff in ~${(delayMs / 1000).toFixed(1)}s. Attempt ${retryCount}.`
                );

                return timer(delayMs);
              }

              // For any other error, don't retry, just propagate the error
              console.error(`Container '${container}': Failed with status ${error.status || 'unknown'}. Not retrying this error.`, error);
              return throwError(() => error);
            }
          })
        );
      };

      return from(containers).pipe(
        mergeMap(container => createReadmeObservable(container), 5), // Limit to 5 concurrent requests
        filter(Boolean),
        toArray(),
        map(results => {
          const readmeMap = new Map<string, string>();
          results.forEach(result => readmeMap.set(result.name, result.full_description));
          return readmeMap;
        }),
        catchError(error => {
          console.error("Failed to fetch container readmes:", error);
          return of(new Map<string, string>());
        })
      );
    },
    defaultValue: new Map<string, string>(),
  });

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
        stream: () => this.fetchAllPages<DockerHubTag>(url, [], 'DockerHub tags'),
        defaultValue: [],
      });
      this.containersTags.set(name, tagsRes);
    }
    return this.containersTags.get(name)!.asReadonly();
  }

  /** Retrieves the README files for all containers from Docker Hub */
  getContainersReadmesRes(): Resource<Map<string, string>> {
    return this.containersReadmes.asReadonly();
  }

  /** Returns the global related software resource */
  getRelatedSoftwareRes(): Resource<RelatedSoftware | null> {
    return this.relatedSoftwareRes.asReadonly();
  }

  /* ----- Paging ---- */

  /**
   * Recursively fetches all pages of a paginated DockerHub endpoint.
   *
   * @param url The URL of the current page to fetch.
   * @param allResults The array to store all the results from all pages.
   * @param errorContext Short label used in the error log if a page fails to load.
   */
  private fetchAllPages<T>(url: string, allResults: T[], errorContext: string): Observable<T[]> {
    return this.http.get<{ next: string, results: T[] }>(url).pipe(
      catchError(err => {
        console.error(`Error fetching ${errorContext}:`, err);
        return of({ next: null as string | null, results: [] as T[] });
      }),
      concatMap(response => {
        // Push the current page's results to the allResults array
        allResults.push(...response.results);

        // If there is a next page, continue to fetch the next page; otherwise we're done.
        if (response.next) {
          const indexEndpoint = response.next.indexOf('/v2');
          const nextURL = new URL(response.next.substring(indexEndpoint), this.proxyServerURL).toString();
          return this.fetchAllPages<T>(nextURL, allResults, errorContext);
        }
        return of(allResults);
      }),
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
   * @returns {Observable<DockerHubTag[]>} An Observable that will emit the information about the tags of the Docker container.
   */
  getContainerTags(name: string): Observable<DockerHubTag[]> {
    const url = new URL(`${this.baseDockerHubEndpoint}/${name}/tags?page_size=100`, this.proxyServerURL).toString();
    return this.fetchAllPages<DockerHubTag>(url, [], 'DockerHub tags').pipe(
      catchError(err => {
        console.error('Error fetching DockerHub tags:', err);
        return of([]); // Return an empty array if error
      })
    );
  }
}
