import { Component, inject } from '@angular/core';
import { delay } from 'rxjs';
import { ContainerService } from '../services/container.service';
import { TermStanza } from '../obo/TermStanza';

@Component({
  selector: 'app-search-guided',
  standalone: true,
  imports: [],
  templateUrl: './search-guided.component.html',
  styleUrl: './search-guided.component.css',
})
export class SearchGuidedComponent {
  containerService: ContainerService = inject(ContainerService);

  rootCategories: TermStanza[] = [];
  categories: TermStanza[] = [];

  ngOnInit() {
    this.containerService.getOntology().subscribe((ontology) => {
      const roots = ontology
        .getOntology()
        ?.filter((term) => term.hasParents() === false);
      roots?.forEach((root) => {
        this.rootCategories.push(root);
        this.categories.push(root);
      });
    });
  }

  loadChildren(category: TermStanza): void {
    if (!category.hasChildren()) {
      return;
    }
    this.categories = category.getChildren();
  }

  goUpLevel(): void {
    const parent = this.categories[0].getParents()[0];
    if (parent === undefined || !parent.hasParents()) {
      this.categories = this.rootCategories;
    } else {
      this.categories = parent.getParents()[0].getChildren();
    }
  }
}
