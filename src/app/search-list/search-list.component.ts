import { Component } from '@angular/core';
import dockerfiles from '../../assets/contents.json';

@Component({
  selector: 'app-search-list',
  standalone: true,
  imports: [],
  templateUrl: './search-list.component.html',
  styleUrl: './search-list.component.css'
})
export class SearchListComponent {
  containers = dockerfiles;

  /*constructor() {
    dockerfiles.forEach((element) => {
      if (element.type === 'dir') {
        this.containers.push(element.name);
      }
    });
  }*/
}
