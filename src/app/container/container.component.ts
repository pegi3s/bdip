import { Component, inject } from '@angular/core';
import { DockerHubImage } from '../models/docker-hub-image';
import { DockerHubTag } from '../models/docker-hub-tag';
import { ActivatedRoute } from '@angular/router';
import { ContainerService } from '../services/container.service';
import { MarkdownModule } from 'ngx-markdown';
import { DatePipe, SlicePipe } from '@angular/common';
import { ThemeService } from '../services/theme.service';
import { ClipboardButtonComponent } from '../clipboard-button/clipboard-button.component';
import { TabsComponent } from "../tabs/tabs.component";

@Component({
  selector: 'app-container',
  standalone: true,
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.css', '../markdown-body.css'],
  host: { '[class.dark]': 'isDarkTheme' },
  imports: [DatePipe, SlicePipe, MarkdownModule, TabsComponent]
})
export class ContainerComponent {
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  containerService: ContainerService = inject(ContainerService);

  readonly clipboardButton = ClipboardButtonComponent;

  container?: DockerHubImage;
  containerTags?: DockerHubTag[];

  showReadme = true;

  themeService: ThemeService = inject(ThemeService);
  isDarkTheme: boolean = false;

  constructor() {
    this.activatedRoute.params.subscribe(params => {
      const containerName = this.activatedRoute.snapshot.params['name'];
      this.containerService.getContainerInfo(containerName).subscribe(
        container => this.container = container,
      );
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
