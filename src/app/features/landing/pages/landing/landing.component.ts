import { Component, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SearchGuidedComponent } from "../../../containers/pages/search-guided/search-guided.component";
import { SearchListComponent } from '../../../../search-list/search-list.component';
import { ReasonListComponent } from '../../../../reason-list/reason-list.component';
import { ContributorCardComponent } from "../../components/contributor-card/contributor-card.component";
import { ContributorService } from '../../../../services/contributor.service';
import { Contributor } from '../../models/contributor.model';
import { LogoMarqueeComponent } from "../../../../shared/components/logo-marquee/logo-marquee.component";
import { Router } from '@angular/router';
import { ThemeService } from '../../../../services/theme.service';
import { TabsComponent } from '../../../../shared/components/tabs/tabs.component';
import { UtilsService } from '../../../../services/utils.service';
import { OS } from '../../../../models/os';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  imports: [ReasonListComponent, SearchGuidedComponent, SearchListComponent, NgOptimizedImage, TabsComponent, ContributorCardComponent, LogoMarqueeComponent],
  host: {'[class.dark]':'isDarkTheme'}
})
export class LandingComponent {
  /* Services */
  utilsService: UtilsService = inject(UtilsService);
  themeService: ThemeService = inject(ThemeService);
  isDarkTheme: boolean = false;
  contributorService: ContributorService = inject(ContributorService);

  /* Data */
  authors: Contributor[];
  contributors: Contributor[];
  supporters: string[] = [
    'assets/images/logo-cresc_algarve_2020.png',
    'assets/images/logo-lisboa_2020.webp',
    'assets/images/logo-norte_2020.png',
    'assets/images/logo-portugal_2020.png',
    'assets/images/logo-uniao_europeia_fundos_europeus.png',
    'assets/images/logo-fct.png',
  ];

  /* State */
  searchClicked: boolean = false;
  gettingStartedOS: OS;

  /* Helpers */
  OS = OS;

  constructor(private router: Router) {
    this.gettingStartedOS = this.utilsService.getOS() as OS;
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

  onTabSelectedGettingStarted(os: string) {
    this.gettingStartedOS = os as OS;
  }
}