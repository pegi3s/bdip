import { Component } from '@angular/core';

@Component({
  selector: 'app-search-guided',
  standalone: true,
  imports: [],
  templateUrl: './search-guided.component.html',
  styleUrl: './search-guided.component.css'
})
export class SearchGuidedComponent {
  categories = ["General tools", "Image building tools", "Recombination", "Plasmid prediction"];
}
