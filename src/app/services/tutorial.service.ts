import { inject, Service } from '@angular/core';
import { Tutorial } from '../models/tutorial';
import { HttpClient } from '@angular/common/http';
import { Observable, of, ReplaySubject, catchError, map } from 'rxjs';
import { githubInfo } from '../core/constants/github-info';
import { rxResource } from "@angular/core/rxjs-interop";
import { VideoTutorial } from "../models/video-tutorial";

@Service()
export class TutorialService {
  private readonly http = inject(HttpClient);

  private readonly githubTutorialDirUrl: string = `https://api.github.com/repos/${githubInfo.owner}/${githubInfo.repository}/contents/metadata/web/tutorials`;

  private tutorials: Tutorial[] = [];

  private readonly tutorialsSubject = new ReplaySubject<Tutorial[]>(1);
  private readonly tutorials$: Observable<Tutorial[]> = this.tutorialsSubject.asObservable();

  constructor() {
    this.loadTutorials();
  }

  /**
   * Loads the list of tutorials from the server.
   *
   * This method first fetches the list of tutorial files from the server. It filters out any items that are not files.
   *
   * For each tutorial file, it creates a tutorial object with the following properties:
   * - `name`: the name of the tutorial, derived from the filename by removing the '.md' extension, replacing hyphens with spaces, and capitalizing the first letter of each word
   * - `filename`: the filename of the tutorial, derived from the filename by removing the '.md' extension
   * - `url`: the URL to download the tutorial file
   *
   * After creating the tutorial objects, it updates the `tutorials` property and emits the new list of tutorials through the `tutorialsSubject`.
   *
   * Finally, it calls `loadAditionalInfoTutorials` to load additional information for each tutorial.
   */
  private loadTutorials(): void {
    // First load the basic tutorial information
    this.getTutorialListing().pipe(
      map((items: GithubListingItem[]) => items.filter(item => item.type === 'file' && item.name.endsWith('.md'))),
      catchError(error => {
        console.error('Error loading tutorials:', error);
        return of([] as GithubListingItem[]);
      })
    ).subscribe((tutorials: GithubListingItem[]) => {
      this.tutorials = tutorials.map(item => ({
        name: item.name.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        filename: item.name.replace('.md', ''),
        url: item.download_url! // Files always have a download_url
      }));
      // Emit a new array reference so zoneless/signal consumers update
      this.tutorialsSubject.next([...this.tutorials]);

      this.loadAditionalInfoTutorials();
    });
  }

  /**
   * Loads additional information for each tutorial.
   *
   * This method performs three main tasks:
   *
   * 1. Fetches the Markdown content for each tutorial. It extracts the first line of the content and sets it as the tutorial description.
   * 2. Retrieves tutorial images from the server and associates them with the corresponding tutorial.
   * 3. Assigns a placeholder image to tutorials without an image.
   */
  private loadAditionalInfoTutorials(): void {
    // Get the Markdown content for each tutorial
    this.tutorials.forEach(tutorial => {
      this.getTutorialDescription(tutorial);
    });
    // Get the images for each tutorial
    this.getTutorialImages().pipe(
      map((items: GithubListingItem[]) => items.filter(item => item.type === 'file')),
      catchError(error => {
        console.error('Error loading tutorial images:', error);
        return of([] as GithubListingItem[]);
      })
    ).subscribe((images: GithubListingItem[]) => {
      this.tutorials = this.tutorials.map((tutorial) => {
        const image = images.find(
          (item) => tutorial.filename === item.name.replace(/\.[^/.]+$/, ''),
        );
        return image?.download_url
          ? { ...tutorial, image: image.download_url }
          : tutorial;
      });

      // After images are loaded, assign placeholders to tutorials that don't have an image
      const numGradients = 3;
      let gradientIndex = 1;
      this.tutorials = this.tutorials.map((tutorial) => {
        if (tutorial.image) {
          return tutorial;
        }
        const image = `assets/gradients/gradient${gradientIndex}.png`;
        gradientIndex = (gradientIndex % numGradients) + 1;
        return { ...tutorial, image };
      });

      this.tutorialsSubject.next([...this.tutorials]);
    });
  }

  /**
   * Fetches the list of tutorial files from the GitHub repository.
   */
  private getTutorialListing(): Observable<GithubListingItem[]> {
    return this.http.get<GithubListingItem[]>(`${this.githubTutorialDirUrl}?ref=${githubInfo.branch}`);
  }

  /**
   * Fetches the Markdown content for a tutorial and extracts the first line to set it as the tutorial description.
   */
  private getTutorialDescription(tutorial: Tutorial): void {
    this.http.get(tutorial.url, { responseType: 'text' }).pipe(
      catchError(error => {
        console.error(`Error fetching description for tutorial '${tutorial.filename}':`, error);
        return of(null);
      }),
    ).subscribe((markdown) => {
      if (markdown === null) return;
      const description = markdown.split('\n')[0].replace(/^#+ /, '').replaceAll('`', '');
      this.tutorials = this.tutorials.map((item) =>
        item.filename === tutorial.filename ? { ...item, description } : item,
      );
      this.tutorialsSubject.next([...this.tutorials]);
    });
  }

  /**
   * Fetches the list of tutorial images from the GitHub repository.
   */
  private getTutorialImages(): Observable<GithubListingItem[]> {
    return this.http.get<GithubListingItem[]>(`${this.githubTutorialDirUrl}/images?ref=${githubInfo.branch}`);
  }

  /**
   * @returns An observable that emits the list of tutorials.
   */
  getTutorials(): Observable<Tutorial[]> {
    return this.tutorials$;
  }

  /**
   * @returns A resource that contains the list of video tutorials.
   */
  readonly videoTutorials = rxResource({
    stream: () => this.http.get<VideoTutorial[]>(
      `https://raw.githubusercontent.com/${githubInfo.owner}/${githubInfo.repository}/${githubInfo.branch}/metadata/web/tutorials/video-tutorials.json`
    ).pipe(
      catchError(error => {
        console.error('Error fetching video tutorials:', error);
        return of([] as VideoTutorial[]);
      }),
    ),
    defaultValue: [] as VideoTutorial[],
  }).asReadonly();
}

type GithubListingItem = {
  type: 'dir' | 'file' | 'submodule' | 'symlink';
  size: number;
  name: string;
  path: string;
  sha: string;
  url: string;
  git_url: string | null;
  html_url: string | null;
  download_url: string | null;
  _links: {
    git: string | null;
    html: string | null;
    self: string;
  };
};
