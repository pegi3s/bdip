import { Component, EnvironmentInjector, effect, inject, runInInjectionContext, signal } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { ContainerService } from '../../../../services/container.service';
import { TermStanza } from '../../../../obo/TermStanza';
import { SearchListComponent2 } from "../../../../search-list-2/search-list.component";
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
  router: Router = inject(Router);
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  containerService: ContainerService = inject(ContainerService);

  rootCategories: TermStanza[] = [];
  categories: TermStanza[] = [];
  categorySelectionStack = signal<TermStanza[]>([]);
  searchTerm = signal<string>('');

  constructor(private injector: EnvironmentInjector) {

  }

  ngOnInit() {
    this.containerService.getOntology().subscribe((ontology) => {
      const roots = ontology
        .getOntology()
        ?.filter((term) => term.hasParents() === false);
      roots?.forEach((root) => {
        this.rootCategories.push(root);
        this.categories.push(root);
      });

      // The query parameters are evaluated inside the subscription to the ontology to ensure
      // that the ontology data is available before the query parameters are processed.
      const params = this.activatedRoute.snapshot.queryParams;
      if (params['q']) {
        this.searchTerm.set(params['q']);
      } else if (params['c']) {
        const categoryIds = params['c'].split(',');
        let categoryStack = [];
        let categoryId = categoryIds.shift();
        let category = this.rootCategories.find((root) => root.id === categoryId);
        if (!category) {
          console.error(`Category with id ${categoryId} not found in root`);          
        } else {
          categoryStack.push(category);
          while (category && categoryIds.length > 0) {
            categoryId = categoryIds.shift();
            category = category.getChildren().find((child) => child.id === categoryId);
            if (category) {
              categoryStack.push(category);
            } else {
              console.error(`Category with id ${categoryId} following hierarchy not found`);
            }
          }
          this.categorySelectionStack.set(categoryStack);
          this.categories = categoryStack.at(-1)!.getChildren();
        }
      }

      // The effects always run at least once, so in order to prevent the query parameters from
      // being updated before params are processed, the effects are injected after the parsing
      runInInjectionContext(this.injector, () => {
        effect(() => {
          this.updateRouteWithQuery(this.searchTerm());
        });
        effect(() => {
          this.updateRouteWithCategories(this.categorySelectionStack());
        });
      });
    });
  }

  loadChildren(category: TermStanza): void {
    if (!this.getSelectedCategory()?.hasChildren()) {
      this.categorySelectionStack.update((stack) => {
        stack.pop();
        stack.push(category);
        return [...stack];
      });
    } else if (this.getSelectedCategory() !== category) {
      this.categorySelectionStack.update((stack) => {
        stack.push(category);
        return [...stack];
      });
    }

    if (!category.hasChildren()) {
      return;
    }
    this.categories = category.getChildren();
  }

  goUpLevel(): void {
    if (this.categorySelectionStack().length > 0) {
      this.categorySelectionStack.update((stack) => {
        stack.pop();
        return [...stack];
      });
    }

    if (this.categorySelectionStack().length > 0) {
      const parent = this.categorySelectionStack()[this.categorySelectionStack().length - 1];
      this.categories = parent.getChildren();
    } else {
      this.categories = this.rootCategories;
    }
  }

  getSelectedCategory(): TermStanza | undefined {
    if (this.categorySelectionStack().length === 0) {
      return undefined;
    } else {
      return this.categorySelectionStack()[this.categorySelectionStack().length - 1];
    }
  }

  updateRouteWithQuery(text: string) {
    if (text) {
      this.router.navigate([], {
        queryParams: {
          q: text
        },
      });
    } else {
      this.router.navigate([]);
    }
  }

  updateRouteWithCategories(categorySelectionStack: TermStanza[]) {
    if (categorySelectionStack.length > 0) {
      this.router.navigate([], {
        queryParams: {
          c: categorySelectionStack.map((category) => category.id).join(','),
        },
      });
    } else {
      this.router.navigate([]);
    }
  }
}
