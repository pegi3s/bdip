import { Component, inject, Injector, runInInjectionContext, signal, Signal } from "@angular/core";
import { DockerHubImage } from '../../../../models/docker-hub-image';
import { DockerHubTag } from '../../../../models/docker-hub-tag';
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ContainerService } from '../../../../services/container.service';
import { MarkdownModule } from 'ngx-markdown';
import { DatePipe, NgTemplateOutlet, SlicePipe, ViewportScroller } from "@angular/common";
import { ThemeService } from '../../../../services/theme.service';
import { ClipboardButtonComponent } from '../../../../shared/components/clipboard-button/clipboard-button.component';
import { TabsComponent } from "../../../../shared/components/tabs/tabs.component";
import { BytesToSizePipe } from "../../../../shared/pipes/bytes-to-size/bytes-to-size.pipe";
import { SvgIconComponent } from 'angular-svg-icon';
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";
import { ImageMetadata } from "../../../../models/image-metadata";
import { ReplacePipe } from "../../../../shared/pipes/replace/replace.pipe";
import { TermStanza } from "../../../../obo/TermStanza";

@Component({
    selector: 'app-container',
    templateUrl: './container.component.html',
    styleUrl: './container.component.css',
    host: { '[class.dark]': 'isDarkTheme()' },
    imports: [DatePipe, SlicePipe, MarkdownModule, TabsComponent, BytesToSizePipe, ClipboardButtonComponent, SvgIconComponent, LoadingComponent, NgTemplateOutlet, ReplacePipe, RouterLink]
})
export class ContainerComponent {
  /* Services */
  private readonly injector = inject(Injector);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private viewportScroller = inject(ViewportScroller);
  private containerService: ContainerService = inject(ContainerService);
  private themeService: ThemeService = inject(ThemeService);
  isDarkTheme: Signal<boolean>;

  readonly clipboardButton = ClipboardButtonComponent;

  status: Status = Status.LOADING;
  container?: DockerHubImage;
  containerTags: Signal<DockerHubTag[]> = signal([]);
  ontologyCategories: Signal<TermStanza[][]> = signal([]);

  selectedTab = signal<TabName>(TabName.README);

  constructor() {
    this.isDarkTheme = this.themeService.isDarkTheme();
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      const containerName = this.activatedRoute.snapshot.params['name'];
      this.containerService.getContainerInfo(containerName).subscribe({
        next: (container) => {
          this.container = container;
          this.status = Status.LOADED;
        },
        error: (error) => {
          if (error.status === 404) {
            this.status = Status.ERROR_NOT_FOUND;
          } else {
            this.status = Status.ERROR_SERVER;
          }
        },
      });
      runInInjectionContext(this.injector, () => {
        this.containerTags = this.containerService.getContainerTagsRes(containerName).value;
        this.ontologyCategories = this.containerService.getContainerCategoryHierarchy(containerName);
      });
    });
    this.viewportScroller.setOffset([0, 150]);
    this.activatedRoute.fragment.subscribe(fragment => {
      if (fragment && Object.values(TabName).includes(fragment as TabName)) {
        this.selectedTab.set(fragment as TabName);
      } else {
        this.selectedTab.set(TabName.README);
      }
    });
  }

  getLatestRecommendedTag(containerMetadata?: ImageMetadata | null): string {
    if (!containerMetadata || containerMetadata.recommended.length === 0) {
      return '';
    }

    const latestRecommended = containerMetadata.recommended.find(recommended => recommended.version === containerMetadata.latest);
    if (latestRecommended) {
      return latestRecommended.version;
    }
    // else
    return containerMetadata.recommended[containerMetadata.recommended.length - 1].version;
  }

  buildDockerPullCommand(container: DockerHubImage, tag?: string | null): string {
    let command = `docker pull ${container.namespace}/${container.name}`;
    if (tag)
      command += `:${tag}`;

    return command;
  }

  onTabSelectedGettingStarted(tab: string) {
    this.selectedTab.set(tab as TabName);
    history.pushState(null, "", window.location.pathname + '#' + tab);
  }

  getContainerMetadataByName(name: string): Signal<ImageMetadata | undefined> {
    return this.containerService.getContainerMetadataRes(name);
  }

  getVersionStatus(tag: DockerHubTag, containerMetadata: ImageMetadata): VersionStatus | undefined {
    if (containerMetadata.status === 'Unusable') {
      return VersionStatus.UNUSABLE;
    } else if (containerMetadata.status === 'Not_recommended') {
      return VersionStatus.NOT_RECOMMENDED;
    } else if (containerMetadata.recommended.find(recommended => recommended.version === tag.name)) {
      return VersionStatus.RECOMMENDED;
    } else if (tag.name === containerMetadata.latest) {
      return VersionStatus.LATEST;
    } else if (containerMetadata.bug_found.some(bug => {
      // Handle exact match
      if (bug.version === tag.name) return true;

      // Handle version ranges
      if (bug.version.includes('<') || bug.version.includes('>')) {
        return this.isVersionInRange(tag.name, bug.version);
      }

      return false;
    })) {
      return VersionStatus.BUG_FOUND;
    } else if (containerMetadata.not_working.includes(tag.name)) {
      return VersionStatus.NOT_WORKING;
    } else if (containerMetadata.no_longer_tested.includes(tag.name)) {
      return VersionStatus.NO_LONGER_TESTED;
    }
    return undefined;
  }

  private isVersionInRange(version: string, range: string): boolean {
    // Handle special case for "latest"
    if (version === 'latest') {
      // Typically "latest" is considered newer than any specific version
      // So "latest" would be > any version number
      const operator = range.substring(0, 2).includes('=') ? range.substring(0, 2) : range.substring(0, 1);
      return operator.includes('>'); // Only true for '>' or '>='
    }

    // Parse the version and range
    const cleanVersion = version.replace(/^v/, '');
    const operator = range.substring(0, 2).includes('=') ? range.substring(0, 2) : range.substring(0, 1);
    const rangeVersion = range.replace(operator, '').trim();

    // Handle versions with suffixes like "SNAPSHOT"
    const parsedVersion = cleanVersion.split('-')[0]; // Take only the version part before any suffix

    // Split versions into components
    const versionParts = parsedVersion.split('.').map(Number);
    const rangeParts = rangeVersion.split('.').map(Number);

    // Compare version components
    for (let i = 0; i < Math.max(versionParts.length, rangeParts.length); i++) {
      const vPart = versionParts[i] || 0;
      const rPart = rangeParts[i] || 0;

      if (vPart !== rPart) {
        const comparison = vPart > rPart ? 1 : -1;

        switch (operator) {
          case '<=': return comparison <= 0;
          case '>=': return comparison >= 0;
          case '<': return comparison < 0;
          case '>': return comparison > 0;
          default: return false;
        }
      }
    }

    // If we get here, the versions are equal in their numerical parts
    // For suffixed versions like "1.7.0-SNAPSHOT" compared to "1.7.0":
    if (cleanVersion.includes('-') && !rangeVersion.includes('-')) {
      // If the operator is <= or <, pre-release versions are considered lower
      // If the operator is >= or >, pre-release versions are considered higher
      return operator.includes('<');
    }

    // For exact equality
    return operator.includes('=');
  }

  removeReadmeOwnershipHeader(readme: string): string {
    return readme.replace(/# This image belongs to a larger project called Bioinformatics Docker Images Project.*/, '');
  }

  getIdHierarchy(category: TermStanza): string[] {
    // Base case: if no parents, return just this ID
    if (!category.hasParents()) {
      return [category.id];
    }

    // Get the hierarchy of the parents
    const parentIds = category.getParents().map(parent => this.getIdHierarchy(parent));
    return parentIds.flat().concat(category.id);
  }

  protected readonly Status = Status;
  protected readonly VersionStatus = VersionStatus;
  protected readonly TabName = TabName;
}

enum Status {
  LOADING,
  LOADED,
  ERROR_NOT_FOUND,
  ERROR_SERVER,
}

enum VersionStatus {
  RECOMMENDED,
  LATEST,
  BUG_FOUND,
  NOT_WORKING,
  NO_LONGER_TESTED,
  // Hacky way to avoid writing more code
  NOT_RECOMMENDED,
  UNUSABLE
}

enum TabName {
  README = 'readme',
  TAGS = 'tags',
  TESTING = 'testing',
}
