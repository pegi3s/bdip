import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Ontology } from '../obo/Ontology';

@Injectable({
  providedIn: 'root',
})
export class ContainerService {
  private urlDiaf = './assets/dio.diaf';
  private urlObo = './assets/dio.obo';
  private containersCache?: Observable<Map<string, Set<string>>>;
  private ontologyCache?: Observable<Ontology>;

  constructor(private http: HttpClient) {}

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
   * Fetch the OBO file that contains the ontology.
   *
   * @returns {Observable<string>} The raw data from the OBO file.
   */
  private getRawOntology(): Observable<string> {
    return this.http.get(this.urlObo, { responseType: 'text' });
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

  getAllContainers() {
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

  getOntology(): Observable<Ontology> {
    if (this.ontologyCache) {
      return this.ontologyCache;
    }

    this.ontologyCache = this.getRawOntology().pipe(
      map((data) => new Ontology(data)),
      shareReplay(1),
    );

    return this.ontologyCache;
  }
}
