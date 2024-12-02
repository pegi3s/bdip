import { Component, inject, signal, Signal } from "@angular/core";
import { DockerHubImage } from '../../../../models/docker-hub-image';
import { DockerHubTag } from '../../../../models/docker-hub-tag';
import { ActivatedRoute } from '@angular/router';
import { ContainerService } from '../../../../services/container.service';
import { MarkdownModule } from 'ngx-markdown';
import { AsyncPipe, DatePipe, NgTemplateOutlet, SlicePipe } from "@angular/common";
import { ThemeService } from '../../../../services/theme.service';
import { ClipboardButtonComponent } from '../../../../shared/components/clipboard-button/clipboard-button.component';
import { TabsComponent } from "../../../../shared/components/tabs/tabs.component";
import { BytesToSizePipe } from "../../../../shared/pipes/bytes-to-size/bytes-to-size.pipe";
import { SvgIconComponent } from 'angular-svg-icon';
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";
import { ImageMetadata } from "../../../../models/image-metadata";
import { Observable } from "rxjs";
import { ReplaceExampleDirPipe } from "../../pipes/replace-example-dir/replace-example-dir.pipe";

@Component({
    selector: 'app-container',
    templateUrl: './container.component.html',
    styleUrl: './container.component.css',
    host: { '[class.dark]': 'isDarkTheme()' },
  imports: [AsyncPipe, DatePipe, SlicePipe, MarkdownModule, TabsComponent, BytesToSizePipe, ClipboardButtonComponent, SvgIconComponent, LoadingComponent, NgTemplateOutlet, ReplaceExampleDirPipe]
})
export class ContainerComponent {
  /* Services */
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private containerService: ContainerService = inject(ContainerService);
  private themeService: ThemeService = inject(ThemeService);
  isDarkTheme: Signal<boolean>;

  readonly clipboardButton = ClipboardButtonComponent;

  status: Status = Status.LOADING;
  container?: DockerHubImage;
  containerTags?: DockerHubTag[];

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
      this.containerService.getContainerTags(containerName).subscribe(
        containerTags => this.containerTags = containerTags,
      );
    });
  }

  buildDockerPullCommand(container: DockerHubImage, tag?: string | null): string {
    let command = `docker pull ${container.namespace}/${container.name}`;
    if (tag)
      command += `:${tag}`;

    return command;
  }

  onTabSelectedGettingStarted(tab: string) {
    this.selectedTab.set(tab as TabName);
  }

  getContainerMetadataByName(name: string): Observable<ImageMetadata | undefined> {
    return this.containerService.getContainerMetadata(name);
  }

  getVersionStatus(tag: DockerHubTag, containerMetadata: ImageMetadata): VersionStatus | undefined {
    if (containerMetadata.status === 'Unusable') {
      return VersionStatus.UNUSABLE;
    } else if (containerMetadata.status === 'Not_recommended') {
      return VersionStatus.NOT_RECOMMENDED;
    } else if (tag.name === containerMetadata.recommended) {
      return VersionStatus.RECOMMENDED;
    } else if (tag.name === containerMetadata.latest) {
      return VersionStatus.LATEST;
    } else if (containerMetadata.bug_found.includes(tag.name)) {
      return VersionStatus.BUG_FOUND;
    } else if (containerMetadata.not_working.includes(tag.name)) {
      return VersionStatus.NOT_WORKING;
    } else if (containerMetadata.no_longer_tested.includes(tag.name)) {
      return VersionStatus.NO_LONGER_TESTED;
    }
    return undefined;
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
  TEST_DATA = 'test-data',
}
