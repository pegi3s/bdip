import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ContributorCardComponent } from "../../components/contributor-card/contributor-card.component";
import { ContributorService } from '../../../../services/contributor.service';
import { Contributor } from '../../models/contributor.model';
import { LogoMarqueeComponent } from "../../../../shared/components/logo-marquee/logo-marquee.component";
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../../../services/theme.service';
import { TabsComponent } from '../../../../shared/components/tabs/tabs.component';
import { ClipboardButtonComponent } from "../../../../shared/components/clipboard-button/clipboard-button.component";
import { ReasonCardComponent } from "../../../../shared/components/reason-card/reason-card.component";

@Component({
    selector: 'app-landing',
    standalone: true,
    templateUrl: './landing.component.html',
    styleUrl: './landing.component.css',
    host: { '[class.dark]': 'isDarkTheme' },
    imports: [NgOptimizedImage, TabsComponent, ContributorCardComponent, LogoMarqueeComponent, ClipboardButtonComponent, RouterLink, ReasonCardComponent]
})
export class LandingComponent {
  /* Services */
  private router: Router = inject(Router);
  private themeService: ThemeService = inject(ThemeService);
  isDarkTheme: boolean = false;
  private contributorService: ContributorService = inject(ContributorService);

  /* HTML Elements */
  citingQuoteElem = viewChild<ElementRef>('citingQuote');

  /* Data */
  authors: Contributor[];
  contributors: Contributor[];
  supporters: string[] = [
    'assets/images/supporters/logo-cresc_algarve_2020.png',
    'assets/images/supporters/logo-lisboa_2020.webp',
    'assets/images/supporters/logo-norte_2020.png',
    'assets/images/supporters/logo-portugal_2020.png',
    'assets/images/supporters/logo-uniao_europeia_fundos_europeus.png',
    'assets/images/supporters/logo-fct.png',
  ];
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

  /* State */
  searchClicked: boolean = false;

  constructor() {
    this.authors = this.contributorService.getAuthors();
    this.contributors = this.contributorService.getContributors();
    this.themeService.isDarkTheme().subscribe(isDark => {
      this.isDarkTheme = isDark;
    });
  }

  onSearchClick() {
    this.searchClicked = true;
    setTimeout(() => {
      this.router.navigate(['/search']);
    }, 600);
  }
}
