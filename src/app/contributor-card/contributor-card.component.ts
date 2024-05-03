import { Component, Input, OnInit, inject } from '@angular/core';
import { Contributor } from '../models/contributor.model';
import { ContactType } from '../models/contact-type';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-contributor-card',
  standalone: true,
  imports: [],
  templateUrl: './contributor-card.component.html',
  styleUrl: './contributor-card.component.css',
  host: {'[class.dark]':'isDarkTheme'}
})
export class ContributorCardComponent implements OnInit {
  @Input() contributor!: Contributor;
  email!: string | undefined;
  orcid!: string | undefined;
  github!: string | undefined;

  themeService: ThemeService = inject(ThemeService);
  isDarkTheme: boolean = false;

  constructor() {
    this.themeService.isDarkTheme().subscribe(isDark => this.isDarkTheme = isDark);
  }

  ngOnInit() {
    this.email = this.contributor.contactInfo.find(contact => contact.type === ContactType.Email)?.value;
    this.orcid = this.contributor.contactInfo.find(contact => contact.type === ContactType.Orcid)?.value;
    this.github = this.contributor.contactInfo.find(contact => contact.type === ContactType.Github)?.value;
  }
}
