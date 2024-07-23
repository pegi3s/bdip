import { Injectable } from '@angular/core';
import { Contributor } from '../features/landing/models/contributor.model';
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
      contactInfo: {
        email: 'jbvieira@ibmc.up.pt',
        orcid: '0000-0001-7032-5220',
        github: 'Jorge-Vieira',
      },
      organizations: [Organization.i3S, Organization.IBMC],
    },
    {
      name: 'Hugo López Fernández',
      description: '',
      photo: 'https://github.com/hlfernandez.png',
      contactInfo: {
        email: 'hlfernandez@uvigo.gal',
        orcid: '0000-0002-6476-7206',
        github: 'hlfernandez',
      },
      organizations: [Organization.SING, Organization.CINBIO, Organization.IISGS],
    },
    {
      name: 'Miguel Reboiro Jato',
      description: '',
      photo: 'https://github.com/mrjato.png',
      contactInfo: {
        email: 'mrjato@uvigo.gal',
        orcid: '0000-0001-8749-2703',
        github: 'mrjato',
      },
      organizations: [Organization.SING, Organization.CINBIO, Organization.IISGS],
    },
    {
      name: 'Cristina Vieira',
      description: '',
      photo: 'https://dozer.i3s.up.pt/fileupload/downloadfile/viewimgnewtab/848187f5fbc1dbe9beae6709edbc60b8',
      contactInfo: {
        email: 'cgvieira@ibmc.up.pt',
        orcid: '0000-0002-7139-2107',
      },
      organizations: [Organization.i3S, Organization.IBMC],
    },
    {
      name: 'Pedro Ferreira',
      description: '',
      photo: 'https://github.com/pedroferreira84.png',
      contactInfo: {
        email: 'pedro.ferreira@i3s.up.pt',
        orcid: '0000-0002-4657-6991',
        github: 'pedroferreira84',
      },
      organizations: [Organization.i3S, Organization.IBMC],
    },
    {
      name: 'Bruno Cavadas',
      description: '',
      photo: 'https://dozer.i3s.up.pt/fileupload/downloadfile/viewimgnewtab/621f4815878accb56f07876abe8bdd',
      contactInfo: {
        email: 'bcavadas@i3s.up.pt',
        orcid: '0000-0003-4104-5398',
      },
      organizations: [Organization.i3S, Organization.IBMC],
    },
  ];

  contributors: Contributor[] = [
    {
      name: 'Daniel Pérez Rodríguez',
      description: 'Since 2021',
      photo: 'https://github.com/Dannyzimmer.png',
      contactInfo: {
        orcid: '0000-0002-8110-3567',
        github: 'Dannyzimmer',
      },
      organizations: [Organization.IISGS],
    },
    {
      name: 'Jorge Vázquez García',
      description: 'Since 2024. Co-developer of the ngs_pipeliner docker image.',
      photo: 'https://media.licdn.com/dms/image/D4E03AQGoto7knZNGmw/profile-displayphoto-shrink_200_200/0/1694502590468?e=2147483647&v=beta&t=oMMkjA20tJjnRxkJdsbKHkyEziMbQ2kq_TbMp4KOSW8',
      contactInfo: {
        orcid: '0000-0002-9204-4013',
      },
      organizations: [Organization.INIBIC],
    },
    {
      name: 'Alba Nogueira Rodríguez',
      description: 'Since 2024',
      photo: 'https://polydeep.org/assets/img/team/alba.png',
      contactInfo: {
        email: 'alnogueira@uvigo.gal',
        orcid: '0000-0001-5991-7698',
        github: 'albanogueira',
      },
      organizations: [Organization.SING],
    },
    {
      name: 'Diogo José Adão',
      description: 'Since 2023. Co-developer of the docker-manager and pegi3sdocnrun docker images.',
      photo: 'https://dozer.i3s.up.pt/fileupload/downloadfile/viewimgnewtab/21f2cca1e5b319b0cdb1c5ff78f219e7',
      contactInfo: {
        email: 'diogoa@i3s.up.pt',
      },
      organizations: [],
    },
    {
      name: 'Miguel Pinto',
      description: 'Since 2023. Co-developer of the auto-phylo docker image.',
      photo: 'https://dozer.i3s.up.pt/fileupload/downloadfile/viewimgnewtab/d821bfb69dc651a025e9dcdc85fd9',
      contactInfo: {
        email: 'mjpinto@i3s.up.pt',
      },
      organizations: [],
    },
    {
      name: 'Mariana Cerqueira Barros',
      description: 'Since 2023. Co-developer of the auto-p2docking docker image.',
      photo: 'https://dozer.i3s.up.pt/fileupload/downloadfile/viewimgnewtab/a05cff4fb3a8996c972ec3e95257d96',
      contactInfo: {
        email: 'mariana.barros@i3s.up.pt',
      },
      organizations: [],
    },
    {
      name: 'Pablo González González',
      description: '',
      photo: 'https://github.com/PabloG02.png',
      contactInfo: {
        github: 'PabloG02',
      },
      organizations: [],
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
