import { Component, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SearchComponent } from '../search/search.component';
import { SearchGuidedComponent } from "../search-guided/search-guided.component";
import { SearchListComponent } from '../search-list/search-list.component';
import { ReasonListComponent } from '../reason-list/reason-list.component';
import { CarouselComponent } from '../carousel/carousel.component';
import { ContributorCardComponent } from "../contributor-card/contributor-card.component";
import { ContributorService } from '../services/contributor.service';
import { Contributor } from '../models/contributor.model';

@Component({
    selector: 'app-landing',
    standalone: true,
    templateUrl: './landing.component.html',
    styleUrl: './landing.component.css',
    imports: [CarouselComponent, ReasonListComponent, SearchComponent, SearchGuidedComponent, SearchListComponent, NgOptimizedImage, ContributorCardComponent]
})
export class LandingComponent {
  contributorService: ContributorService = inject(ContributorService);

  contributors: Contributor[];
  supporters: string[] = [
    'assets/images/logo-cresc_algarve_2020.png',
    'assets/images/logo-lisboa_2020.webp',
    'assets/images/logo-norte_2020.png',
    'assets/images/logo-portugal_2020.png',
    'assets/images/logo-uniao_europeia_fundos_europeus.png',
    'assets/images/logo-fct.png',
  ];

  constructor() {
    this.contributors = this.contributorService.getContributors();
  }
}
