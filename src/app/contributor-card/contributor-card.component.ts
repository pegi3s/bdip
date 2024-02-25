import { Component, Input, OnInit } from '@angular/core';
import { Contributor } from '../models/contributor.model';
import { ContactType } from '../models/contact-type';

@Component({
  selector: 'app-contributor-card',
  standalone: true,
  imports: [],
  templateUrl: './contributor-card.component.html',
  styleUrl: './contributor-card.component.css'
})
export class ContributorCardComponent implements OnInit {
  @Input() contributor!: Contributor;
  email!: string | undefined;
  orcid!: string | undefined;
  github!: string | undefined;

  ngOnInit() {
    this.email = this.contributor.contactInfo.find(contact => contact.type === ContactType.Email)?.value;
    this.orcid = this.contributor.contactInfo.find(contact => contact.type === ContactType.Orcid)?.value;
    this.github = this.contributor.contactInfo.find(contact => contact.type === ContactType.Github)?.value;
  }
}
