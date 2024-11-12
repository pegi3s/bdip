import { Component, EnvironmentInjector, computed, effect, inject, runInInjectionContext, signal, Signal } from "@angular/core";
import { trigger, transition, style, animate } from '@angular/animations';
import { ContainerService } from '../../../../services/container.service';
import { TermStanza } from '../../../../obo/TermStanza';
import { SearchListComponent } from "../../components/search-list-2/search-list.component";
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeService } from '../../../../services/theme.service';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  selector: 'app-search-guided',
  standalone: true,
  imports: [FormsModule, SearchListComponent, SvgIconComponent],
  templateUrl: './search-guided.component.html',
  styleUrl: './search-guided.component.css',
  host: { '[class.dark]': 'isDarkTheme()' },
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class SearchGuidedComponent {
  /* Services */
  private router: Router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private envInjector: EnvironmentInjector = inject(EnvironmentInjector);
  private containerService: ContainerService = inject(ContainerService);
  private themeService: ThemeService = inject(ThemeService);
  isDarkTheme: Signal<boolean>;

  /** The root categories of the ontology. */
  rootCategories = signal<TermStanza[]>([]);
  /** The current cantegories between which the user can navigate. */
  categories = computed(() => {
    if (this.getSelectedCategory()) {
      return this.getSelectedCategory()!.getChildren();
    } else {
      return this.rootCategories();
    }
  });
  /** The stack of categories that the user has selected. */
  categorySelectionStack = signal<TermStanza[]>([]);
  /** The search term that the user has entered. */
  searchTerm = signal<string>('');
  /** Whether to show all containers. */
  showAll = signal<boolean>(false);

  constructor() {
    this.isDarkTheme = this.themeService.isDarkTheme();
  }

  ngOnInit() {
    // Load the ontology and set the root categories
    this.containerService.getOntology().subscribe((ontology) => {
      this.rootCategories.set(ontology.getRootTerms());

      // The query parameters are evaluated inside the subscription to the ontology to ensure
      // that the ontology data is available before the query parameters are processed.
      this.activatedRoute.queryParams.subscribe((params) => {
        if (!this.showAll() && params['showAll'] === 'true') {
          // The user has requested to show all containers
          this.showAll.set(true);
          if (this.categorySelectionStack().length > 0 || this.searchTerm()) {
            // If the user has selected a category or entered a search term, clear them when moving to show all
            this.clearSearch();
          }
        }

        let searchQuery = '';
        let categoryStack = [];

        if (params['q']) {
          // Set the search term
          searchQuery = params['q'];
        } else if (params['c']) {
          // Set the category selection stack
          const categoryIds = params['c'].split(',');
          let categoryId = categoryIds.shift();
          let category = this.rootCategories().find((root) => root.id === categoryId);
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
          }
        }

        // Update the signals with the query parameters
        this.searchTerm.set(searchQuery);
        // [] == [] is false, so we need to compare the elements of the arrays to not trigger an update when the arrays are the same
        if (!(categoryStack.length === this.categorySelectionStack().length
          && categoryStack.every((element, index) => element === this.categorySelectionStack()[index]))) {
          this.categorySelectionStack.set(categoryStack);
        }

        // The effects always run at least once, so in order to prevent the query parameters from
        // being updated before params are processed, the effects are injected after the parsing
        runInInjectionContext(this.envInjector, () => {
          effect(() => {
            this.updateRoute(this.showAll(), this.searchTerm(), this.categorySelectionStack());
          });
        });
      });
    });
  }

  /**
   * Load the children categories of the selected category by updating the category selection stack.
   * The categories between which the user can navigate are determined by a computed signal.
   *
   * @param {TermStanza} category - The selected category for which to load the children.
   */
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
  }

  /**
   * Navigates up one level in the category selection stack.
   */
  goUpLevel(): void {
    if (this.categorySelectionStack().length > 0) {
      this.categorySelectionStack.update((stack) => {
        stack.pop();
        return [...stack];
      });
    }
  }

  /**
   * Navigates to a specific level in the category selection stack.
   * If the level is valid, all categories above that level are removed from the stack.
   *
   * @param {number} level - The level to navigate to.
   */
  goToLevel(level: number): void {
    if (level < 0 || level >= this.categorySelectionStack().length) {
      console.error(`Invalid level ${level}`);
      return;
    }

    this.categorySelectionStack.update((stack) => {
      stack.splice(level + 1);
      return [...stack];
    });
  }

  /**
   * Clears the current search term and category selection stack.
   */
  clearSearch(): void {
    this.searchTerm.set('');
    this.categorySelectionStack.set([]);
  }

  /**
   * Returns the last selected category from the category selection stack.
   * If the stack is empty, it returns undefined.
   *
   * @returns {TermStanza | undefined} The last selected category or undefined if the stack is empty.
   */
  getSelectedCategory(): TermStanza | undefined {
    if (this.categorySelectionStack().length === 0) {
      return undefined;
    } else {
      return this.categorySelectionStack().at(-1);
    }
  }

  /**
   * Updates the route based on the provided parameters.
   *
   * If `showAll` is true, it adds a `showAll` query parameter.
   * If `text` is provided, it adds a `q` query parameter with the text.
   * If `categorySelectionStack` is provided and not empty, it adds a `c` query parameter with the category IDs joined by commas.
   *
   * If no query parameters are added, it navigates to the base route.
   *
   * @param {boolean} showAll - Determines whether to show all categories.
   * @param {string} text - The search text query.
   * @param {TermStanza[]} categorySelectionStack - The stack of selected categories.
   */
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
