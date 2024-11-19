import { Component, inject, Signal } from "@angular/core";
import { DockerHubImage } from '../../../../models/docker-hub-image';
import { DockerHubTag } from '../../../../models/docker-hub-tag';
import { ActivatedRoute } from '@angular/router';
import { ContainerService } from '../../../../services/container.service';
import { MarkdownModule } from 'ngx-markdown';
import { AsyncPipe, DatePipe, SlicePipe } from '@angular/common';
import { ThemeService } from '../../../../services/theme.service';
import { ClipboardButtonComponent } from '../../../../shared/components/clipboard-button/clipboard-button.component';
import { TabsComponent } from "../../../../shared/components/tabs/tabs.component";
import { BytesToSizePipe } from "../../../../shared/pipes/bytes-to-size/bytes-to-size.pipe";
import { SvgIconComponent } from 'angular-svg-icon';
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";
import { ImageMetadata } from "../../../../models/image-metadata";
import { Observable } from "rxjs";

@Component({
  selector: 'app-container',
  standalone: true,
  templateUrl: './container.component.html',
  styleUrl: './container.component.css',
  host: { '[class.dark]': 'isDarkTheme()' },
  imports: [AsyncPipe, DatePipe, SlicePipe, MarkdownModule, TabsComponent, BytesToSizePipe, ClipboardButtonComponent, SvgIconComponent, LoadingComponent]
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

  showReadme = true;

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

  onTabSelectedGettingStarted(tab: string) {
    this.showReadme = tab === 'readme';
  }

  getContainerMetadataByName(name: string): Observable<ImageMetadata | undefined> {
    return this.containerService.getContainerMetadata(name);
  }

  getVersionStatus(tag: DockerHubTag, containerMetadata: ImageMetadata): VersionStatus | undefined {
    if (tag.name === containerMetadata.recommended) {
      return VersionStatus.RECOMMENDED;
    } else if (tag.name === containerMetadata.latest) {
      return VersionStatus.LATEST;
    } else if (containerMetadata.useful.includes(tag.name)) {
      return VersionStatus.USEFUL;
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
  USEFUL,
  BUG_FOUND,
  NOT_WORKING,
  NO_LONGER_TESTED
}
