import { Component, inject } from '@angular/core';
import { DockerHubImage } from '../models/docker-hub-image';
import { DockerHubTag } from '../models/docker-hub-tag';
import { ActivatedRoute } from '@angular/router';
import { ContainerService } from '../services/container.service';
import { MarkdownModule } from 'ngx-markdown';
import { DatePipe, SlicePipe } from '@angular/common';

@Component({
  selector: 'app-container',
  standalone: true,
  imports: [DatePipe, SlicePipe, MarkdownModule],
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.css', '../markdown-body.css']
})
export class ContainerComponent {
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  containerService: ContainerService = inject(ContainerService);

  container?: DockerHubImage;
  containerTags?: DockerHubTag[];

  showReadme = true;

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
  }
}
