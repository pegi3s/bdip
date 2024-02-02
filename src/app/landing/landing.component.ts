import { Component } from '@angular/core';
import { ContributorListComponent } from '../contributor-list/contributor-list.component';
import { SearchComponent } from '../search/search.component';
import { SearchListComponent } from '../search-list/search-list.component';
import { ReasonListComponent } from '../reason-list/reason-list.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [ReasonListComponent, ContributorListComponent, SearchComponent, SearchListComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {

}
