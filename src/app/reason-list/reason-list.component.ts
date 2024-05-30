import { Component } from '@angular/core';
import { ReasonCardComponent } from '../shared/components/reason-card/reason-card.component';

@Component({
  selector: 'app-reason-list',
  standalone: true,
  imports: [ReasonCardComponent],
  templateUrl: './reason-list.component.html',
  styleUrl: './reason-list.component.css'
})
export class ReasonListComponent {
  features = [
    {
      icon: 'play_circle',
      title: 'Effortless Deployment and Ready-to-Run',
      description: 'Simple installation of Docker grants access to a variety of scientific tools without complex setups and ready to run.',
      color: 0,
    },
    {
      icon: 'computer',
      title: 'Portability, Consistency, and Cross-Platform Compatibility',
      description: 'Ensures consistent performance across different computing environments, making it easy to switch between Linux and Windows platforms.',
      color: 130,
    },
    {
      icon: 'hub',
      title: 'Centralized Repository (Docker Hub)',
      description: 'Publicly share and access Docker images, fostering collaboration within the research community.',
      color: 240,
    },
    {
      icon: 'account_tree',
      title: 'Pipeline Integration',
      description: 'Ideal for integration into bioinformatics pipelines, ensuring consistency and reproducibility in scientific analyses.',
      color: 300,
    }
  ];
}
