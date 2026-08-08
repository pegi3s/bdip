import { inject, Service } from "@angular/core";
import { Contributor } from "../features/landing/models/contributor.model";
import * as Organization from "../models/organization";
import { Observable, of, ReplaySubject } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { githubInfo } from "../core/constants/github-info";

interface Collaborators {
  authors: Contributor[];
  contributors: Contributor[];
}

@Service()
export class ContributorService {
  private readonly baseMetadataURL = `https://raw.githubusercontent.com/${githubInfo.owner}/${githubInfo.repository}/${githubInfo.branch}/metadata/`;
  private readonly urlContributors = `${this.baseMetadataURL}/contributors.json`;

  private readonly http = inject(HttpClient);

  private readonly collaboratorsSubject = new ReplaySubject<Collaborators>(1);
  private readonly collaborators$: Observable<Collaborators> = this.collaboratorsSubject.asObservable();

  constructor() {
    this.getContributorsJson();
  }

  private getContributorsJson(): void {
    this.http.get<Collaborators>(this.urlContributors).pipe(
      map(data => {
        // Function to map organization acronyms to their corresponding Organization objects
        const mapOrganizations = (person: { organizations: (string | Organization.Organization)[] }) => {
          person.organizations = person.organizations.map(orgAcronym =>
            Organization[orgAcronym as keyof typeof Organization] // Cast the string to the key of Organization
          );
        };

        data.authors.forEach(mapOrganizations);
        data.contributors.forEach(mapOrganizations);

        return data;
      }),
      catchError(error => {
        console.error("Error fetching contributors:", error);
        return of<Collaborators>({ authors: [], contributors: [] });
      })
    ).subscribe(data => this.collaboratorsSubject.next(data));
  }

  getAuthors(): Observable<Contributor[]> {
    return this.collaborators$.pipe(
      map(data => data.authors)
    );
  }

  getContributors(): Observable<Contributor[]> {
    return this.collaborators$.pipe(
      map(data => data.contributors)
    );
  }
}
