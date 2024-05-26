import { Injectable } from '@angular/core';
import { ContactType } from '../models/contact-type';
import { Contributor } from '../models/contributor.model';
import * as Organization from '../models/organization';

@Injectable({
  providedIn: 'root'
})
export class ContributorService {
  authors: Contributor[] = [
    {
      name: 'Jorge Vieira',
      description: '',
      photo: 'https://dozer.i3s.up.pt/fileupload/downloadfile/viewimgnewtab/1bafd91f456215e50e9fb655dfd256fb',
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
      photo: 'https://github.com/hlfernandez.png',
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
      photo: 'https://github.com/mrjato.png',
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
      photo: 'https://dozer.i3s.up.pt/fileupload/downloadfile/viewimgnewtab/848187f5fbc1dbe9beae6709edbc60b8',
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
      photo: 'https://github.com/pedroferreira84.png',
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
      photo: 'https://dozer.i3s.up.pt/fileupload/downloadfile/viewimgnewtab/621f4815878accb56f07876abe8bdd',
      contactInfo: [
        { type: ContactType.Email, value: 'bcavadas@i3s.up.pt' },
        { type: ContactType.Orcid, value: '0000-0003-4104-5398' },
        { type: ContactType.Github, value: '' },
      ],
      organizations: [Organization.i3S, Organization.IBMC],
    },
  ];

  contributors: Contributor[] = [
    {
      name: 'Daniel Pérez Rodríguez',
      description: 'Since 2021',
      photo: 'https://github.com/Dannyzimmer.png',
      contactInfo: [
        { type: ContactType.Github, value: 'Dannyzimmer' },
      ],
      organizations: [Organization.IISGS],
    },
    {
      name: 'Jorge Vázquez García',
      description: 'Since 2024. Main developer of the ngs_pipeliner docker image',
      photo: 'https://media.licdn.com/dms/image/D4E03AQGoto7knZNGmw/profile-displayphoto-shrink_200_200/0/1694502590468?e=2147483647&v=beta&t=oMMkjA20tJjnRxkJdsbKHkyEziMbQ2kq_TbMp4KOSW8',
      contactInfo: [
        { type: ContactType.Orcid, value: '0000-0002-9204-4013' },
      ],
      organizations: [Organization.INIBIC],
    },
    {
      name: 'Alba Nogueira Rodríguez',
      description: 'Since 2024',
      photo: 'https://polydeep.org/assets/img/team/alba.png',
      contactInfo: [
        { type: ContactType.Email, value: 'alnogueira@uvigo.gal' },
        { type: ContactType.Orcid, value: '0000-0001-5991-7698' },
        { type: ContactType.Github, value: 'albanogueira' },
      ],
      organizations: [Organization.SING],
    },
  ];

  constructor() { }

  getAuthors(): Contributor[] {
    return this.authors;
  }

  getContributors(): Contributor[] {
    return this.contributors;
  }
}
