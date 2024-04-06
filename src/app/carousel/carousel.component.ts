import { Component, inject } from '@angular/core';
import { ContainerService } from '../services/container.service';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})
export class CarouselComponent {
  items: string[] = [];
  containerService: ContainerService = inject(ContainerService);

  constructor() {
    this.containerService.getAllContainers().subscribe(containersDistinct => {
      this.items = Array.from(containersDistinct).slice(0, 12);
    });
  }
}
