import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Renderer2, ViewChild, inject } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { ContainerService } from '../../../../services/container.service';
import { TermStanza } from '../../../../obo/TermStanza';
import { SearchListComponent2 } from "../../../../search-list-2/search-list.component";
import { fromEvent, map, startWith } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-guided',
  standalone: true,
  imports: [FormsModule, SearchListComponent2],
  templateUrl: './search-guided.component.html',
  styleUrl: './search-guided.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
  /* host: { '[@fadeIn]': '' }, */
})
export class SearchGuidedComponent {
  containerService: ContainerService = inject(ContainerService);

  rootCategories: TermStanza[] = [];
  categories: TermStanza[] = [];
  categorySelectionStack: TermStanza[] = [];
  searchTerm: string = '';

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
    if (!this.getSelectedCategory()?.hasChildren()) {
      this.categorySelectionStack.pop();
      this.categorySelectionStack.push(category);
    } else if (this.getSelectedCategory() !== category) {
      this.categorySelectionStack.push(category);
    }

    if (!category.hasChildren()) {
      return;
    }
    this.categories = category.getChildren();
  }

  goUpLevel(): void {
    if (this.categorySelectionStack.length > 0) {
      this.categorySelectionStack.pop();
    }

    if (this.categorySelectionStack.length > 0) {
      const parent = this.categorySelectionStack[this.categorySelectionStack.length - 1];
      this.categories = parent.getChildren();
    } else {
      this.categories = this.rootCategories;
    }
  }

  getSelectedCategory(): TermStanza | undefined {
    if (this.categorySelectionStack.length === 0) {
      return undefined;
    } else {
      return this.categorySelectionStack[this.categorySelectionStack.length - 1];
    }
  }
}
