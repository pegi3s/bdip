import { Component } from '@angular/core';
import { Contributor } from '../models/contributor.model';
import { ContactType } from '../models/contact-type';
import { ContributorCardComponent } from '../contributor-card/contributor-card.component';
import { Organization } from '../models/organization';

@Component({
  selector: 'app-contributor-list',
  standalone: true,
  imports: [ContributorCardComponent],
  templateUrl: './contributor-list.component.html',
  styleUrl: './contributor-list.component.css',
})
export class ContributorListComponent {
  // TODO: Move to JSON file
  contributors: Contributor[] = [
    {
      name: 'Jorge Vieira',
      description: '',
      contactInfo: [
        { type: ContactType.Email, value: 'jbvieira@ibmc.up.pt' },
        { type: ContactType.Orcid, value: '0000-0001-7032-5220' },
        { type: ContactType.Github, value: 'Jorge-Vieira' },
      ],
      organizations: [Organization.i3S, Organization.IBMC],
    },
    {
      name: 'Hugo López Fernández',
      description: '',
      contactInfo: [
        { type: ContactType.Email, value: 'hlfernandez@uvigo.gal' },
        { type: ContactType.Orcid, value: '0000-0002-6476-7206' },
        { type: ContactType.Github, value: 'hlfernandez' },
      ],
      organizations: [Organization.SING, Organization.CINBIO, Organization.IISGS],
    },
    {
      name: 'Miguel Reboiro Jato',
      description: '',
      contactInfo: [
        { type: ContactType.Email, value: 'mrjato@uvigo.gal' },
        { type: ContactType.Orcid, value: '0000-0001-8749-2703' },
        { type: ContactType.Github, value: 'mrjato' },
      ],
      organizations: [Organization.SING, Organization.CINBIO, Organization.IISGS],
    },
    {
      name: 'Cristina Vieira',
      description: '',
      contactInfo: [
        { type: ContactType.Email, value: 'cgvieira@ibmc.up.pt' },
        { type: ContactType.Orcid, value: '0000-0002-7139-2107' },
        { type: ContactType.Github, value: '' },
      ],
      organizations: [Organization.i3S, Organization.IBMC],
    },
    {
      name: 'Pedro Ferreira',
      description: '',
      contactInfo: [
        { type: ContactType.Email, value: 'pedro.ferreira@i3s.up.pt' },
        { type: ContactType.Orcid, value: '0000-0002-4657-6991' },
        { type: ContactType.Github, value: 'pedroferreira84' },
      ],
      organizations: [Organization.i3S, Organization.IBMC],
    },
    {
      name: 'Bruno Cavadas',
      description: '',
      contactInfo: [
        { type: ContactType.Email, value: 'bcavadas@i3s.up.pt' },
        { type: ContactType.Orcid, value: '0000-0003-4104-5398' },
        { type: ContactType.Github, value: '' },
      ],
      organizations: [Organization.i3S, Organization.IBMC],
    },
  ];
}
