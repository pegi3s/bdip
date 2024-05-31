import { Component, EnvironmentInjector, computed, effect, inject, runInInjectionContext, signal } from '@angular/core';
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
  /* Services */
  router: Router = inject(Router);
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  envInjector: EnvironmentInjector = inject(EnvironmentInjector);
  containerService: ContainerService = inject(ContainerService);

  /** The root categories of the ontology. */
  rootCategories: TermStanza[] = [];
  /** The current cantegories between which the user can navigate. */
  categories = computed(() => {
    if (this.getSelectedCategory()) {
      return this.getSelectedCategory()!.getChildren();
    } else {
      return this.rootCategories;
    }
  });
  /** The stack of categories that the user has selected. */
  categorySelectionStack = signal<TermStanza[]>([]);
  /** The search term that the user has entered. */
  searchTerm = signal<string>('');
  /** Whether to show all containers. */
  showAll = signal<boolean>(false);

  constructor() { }

  ngOnInit() {
    this.containerService.getOntology().subscribe((ontology) => {
      const roots = ontology
        .getAllOntologyTerms()
        ?.filter((term) => term.hasParents() === false);
      if (roots) {
        this.rootCategories.push(...roots);
      }

      // Check if the user has requested to show all containers
      this.activatedRoute.queryParams.subscribe((params) => {
        if (!this.showAll() && params['showAll'] === 'true') {
          this.showAll.set(true);
          this.searchTerm.set('');
          this.categorySelectionStack.set([]);
        }
      });

      // The query parameters are evaluated inside the subscription to the ontology to ensure
      // that the ontology data is available before the query parameters are processed.
      const params = this.activatedRoute.snapshot.queryParams;
      if (params['showAll']) {
        // Handled in the subscription
      } else if (params['q']) {
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
        }
      }

      // The effects always run at least once, so in order to prevent the query parameters from
      // being updated before params are processed, the effects are injected after the parsing
      runInInjectionContext(this.envInjector, () => {
        effect(() => {
          this.updateRoute(this.showAll(), this.searchTerm(), this.categorySelectionStack());
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
  }

  goUpLevel(): void {
    if (this.categorySelectionStack().length > 0) {
      this.categorySelectionStack.update((stack) => {
        stack.pop();
        return [...stack];
      });
    }
  }

  getSelectedCategory(): TermStanza | undefined {
    if (this.categorySelectionStack().length === 0) {
      return undefined;
    } else {
      return this.categorySelectionStack().at(-1);
    }
  }

  updateRoute(showAll: boolean, text: string, categorySelectionStack: TermStanza[]) {
    const queryParams: any = {};

    if (showAll) {
      queryParams.showAll = true;
    }
  
    if (text) {
      queryParams.q = text;
    }
  
    if (categorySelectionStack && categorySelectionStack.length > 0) {
      queryParams.c = categorySelectionStack.map((category) => category.id).join(',');
    }
  
    if (Object.keys(queryParams).length > 0) {
      this.router.navigate([], {
        queryParams,
      });
    } else {
      this.router.navigate([]);
    }
  }
}
