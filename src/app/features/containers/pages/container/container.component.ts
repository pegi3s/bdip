import { Component, inject } from '@angular/core';
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

@Component({
  selector: 'app-container',
  standalone: true,
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.css', '../../../../shared/styles/markdown-body.css'],
  host: { '[class.dark]': 'isDarkTheme' },
  imports: [AsyncPipe, DatePipe, SlicePipe, MarkdownModule, TabsComponent, BytesToSizePipe, ClipboardButtonComponent, SvgIconComponent, LoadingComponent]
})
export class ContainerComponent {
  /* Services */
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private containerService: ContainerService = inject(ContainerService);
  private themeService: ThemeService = inject(ThemeService);
  isDarkTheme: boolean = false;

  readonly clipboardButton = ClipboardButtonComponent;

  status: Status = Status.LOADING;
  container?: DockerHubImage;
  containerTags?: DockerHubTag[];

  showReadme = true;

  constructor() {}

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
    this.themeService.isDarkTheme().subscribe(isDark => this.isDarkTheme = isDark);
  }

  onTabSelectedGettingStarted(tab: string) {
    this.showReadme = tab === 'readme';
  }

  getContainerMetadataByName(name: string) {
    return this.containerService.getContainerMetadata(name);
  }

  protected readonly Status = Status;
}

enum Status {
  LOADING,
  LOADED,
  ERROR_NOT_FOUND,
  ERROR_SERVER,
}
