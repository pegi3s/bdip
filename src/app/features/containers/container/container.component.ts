import { Component, inject } from '@angular/core';
import { DockerHubImage } from '../../../models/docker-hub-image';
import { DockerHubTag } from '../../../models/docker-hub-tag';
import { ActivatedRoute } from '@angular/router';
import { ContainerService } from '../../../services/container.service';
import { MarkdownModule } from 'ngx-markdown';
import { DatePipe, SlicePipe } from '@angular/common';
import { ThemeService } from '../../../services/theme.service';
import { ClipboardButtonComponent } from '../../../shared/components/clipboard-button/clipboard-button.component';
import { TabsComponent } from "../../../shared/components/tabs/tabs.component";
import { BytesToSizePipe } from "../../../shared/pipes/bytes-to-size/bytes-to-size.pipe";

@Component({
  selector: 'app-container',
  standalone: true,
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.css', '../../../shared/styles/markdown-body.css'],
  host: { '[class.dark]': 'isDarkTheme' },
  imports: [DatePipe, SlicePipe, MarkdownModule, TabsComponent, BytesToSizePipe]
})
export class ContainerComponent {
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  containerService: ContainerService = inject(ContainerService);

  readonly clipboardButton = ClipboardButtonComponent;

  httpResponseCode: number = 102;
  container?: DockerHubImage;
  containerTags?: DockerHubTag[];

  showReadme = true;

  themeService: ThemeService = inject(ThemeService);
  isDarkTheme: boolean = false;

  constructor() {
    this.activatedRoute.params.subscribe(params => {
      const containerName = this.activatedRoute.snapshot.params['name'];
      this.containerService.getContainerInfo(containerName).subscribe({
        next: (container) => {
          this.container = container
        },
        error: (error) => this.httpResponseCode = error.status,
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
}
