import { Injectable } from '@angular/core';
import { Tutorial } from '../models/tutorial';

@Injectable({
  providedIn: 'root'
})
export class TutorialService {
  tutorials: Tutorial[] = [
    {
      name: 'Docker in Docker',
      description: 'Running Docker images inside a Docker image',
      url: '/tutorials/docker-in-docker',
      image: 'https://scontent.fvgo3-1.fna.fbcdn.net/v/t39.30808-6/387014737_709990191164525_541744141589515144_n.png?_nc_cat=111&ccb=1-7&_nc_sid=5f2048&_nc_ohc=bhF-JR4kKAcQ7kNvgHMOcfv&_nc_ht=scontent.fvgo3-1.fna&oh=00_AfCVRPkqRFGNDGcMOH3sgbEr8cUS3SRg7bvBPkCFr97WSw&oe=6632C0C8'
    },
    {
      name: 'Singularity',
      description: 'Using project images with Singularity',
      url: '/tutorials/singularity',
      image: 'https://ciq.com/static/c1513e6d4f8ceae1259ede6c601cf29a/c8710/CIQ_blog_Aptnr-ubuntu.webp'
    },
    {
      name: 'Podman',
      description: 'Using project images with Podman',
      url: '/tutorials/podman',
      image: 'https://i0.wp.com/blog.podman.io/wp-content/uploads/2023/07/podman_blog-banner.png?fit=960%2C480&ssl=1'
    },
    {
      name: 'Alias',
      description: 'Creating alias in .bashrc to be used as shortcut',
      url: '/tutorials/alias',
      image: 'https://bashlogo.com/img/symbol/jpg/full_colored_light.jpg'
    },
  ];

  constructor() { }

  getTutorials(): Tutorial[] {
    return this.tutorials;
  }
}
