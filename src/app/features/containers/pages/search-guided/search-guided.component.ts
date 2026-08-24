import {
  Component,
  EnvironmentInjector,
  computed,
  effect,
  inject,
  runInInjectionContext,
  signal,
  Signal,
} from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { ContainerService } from '../../../../services/container.service';
import { TermStanza } from '../../../../obo/TermStanza';
import { SearchListComponent } from '../../components/search-list-2/search-list.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ThemeService } from '../../../../services/theme.service';
import { SvgIconComponent } from 'angular-svg-icon';
import { categoryHasImages } from '../../../../shared/utils/category-images';

/** Compares two arrays by element equality (not identity) — plain `===` always fails on arrays. */
function arraysHaveSameElements<T>(a: readonly T[], b: readonly T[]): boolean {
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

@Component({
  selector: 'app-search-guided',
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
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly envInjector = inject(EnvironmentInjector);
  private readonly containerService = inject(ContainerService);
  private readonly themeService = inject(ThemeService);
  protected readonly isDarkTheme: Signal<boolean> = this.themeService.isDarkTheme;

  /** The root categories of the ontology. */
  protected readonly rootCategories = signal<TermStanza[]>([]);
  /** The stack of categories that the user has selected. */
  protected readonly categorySelectionStack = signal<TermStanza[]>([]);
  /** The last category the user selected, if any. */
  protected readonly selectedCategory = computed(() => this.categorySelectionStack().at(-1));
  /** The current categories between which the user can navigate. */
  protected readonly categories = computed(() => {
    const selected = this.selectedCategory();
    const candidates = selected ? selected.getChildren() : this.rootCategories();
    const containersMap = this.containerService.getContainersMapRes().value();
    return candidates.filter((category) => categoryHasImages(category, containersMap));
  });
  /** The search term that the user has entered. */
  protected readonly searchTerm = signal<string>('');
  /** Whether to show all containers. */
  protected readonly showAll = signal<boolean>(false);
  /** Search inside READMEs. */
  protected readonly searchReadmes = signal<boolean>(false);
  protected readonly readmesLoading = this.containerService.getContainersReadmesRes().isLoading;

  /** Guards against creating the route-sync effect more than once — see ensureRouteSyncEffect(). */
  private routeSyncEffectCreated = false;

  ngOnInit(): void {
    // Load the ontology and set the root categories
    this.containerService.getOntology().subscribe((ontology) => {
      this.rootCategories.set(ontology.getRootTerms());

      // The query parameters are evaluated inside the subscription to the ontology to ensure
      // that the ontology data is available before the query parameters are processed.
      this.activatedRoute.queryParams.subscribe((params) => {
        this.applyQueryParams(params);
        this.ensureRouteSyncEffect();
      });
    });
  }

  /**
   * Load the children categories of the selected category by updating the category selection stack.
   * The categories between which the user can navigate are determined by a computed signal.
   *
   * @param {TermStanza} category - The selected category for which to load the children.
   */
  protected loadChildren(category: TermStanza): void {
    const selected = this.selectedCategory();
    if (!selected?.hasChildren()) {
      this.categorySelectionStack.update((stack) => [...stack.slice(0, -1), category]);
    } else if (selected !== category) {
      this.categorySelectionStack.update((stack) => [...stack, category]);
    }
  }

  /**
   * Navigates up one level in the category selection stack.
   */
  protected goUpLevel(): void {
    if (this.categorySelectionStack().length === 0) {
      return;
    }
    this.categorySelectionStack.update((stack) => stack.slice(0, -1));
  }

  /**
   * Navigates to a specific level in the category selection stack.
   * If the level is valid, all categories above that level are removed from the stack.
   *
   * @param {number} level - The level to navigate to.
   */
  protected goToLevel(level: number): void {
    if (level < 0 || level >= this.categorySelectionStack().length) {
      console.error(`Invalid level ${level}`);
      return;
    }
    this.categorySelectionStack.update((stack) => stack.slice(0, level + 1));
  }

  /**
   * Clears the current search term and category selection stack.
   */
  protected clearSearch(): void {
    this.searchTerm.set('');
    this.categorySelectionStack.set([]);
  }

  /**
   * Applies the current route's query parameters to component state. Called on every
   * queryParams emission so the component also reacts to e.g. browser back/forward.
   */
  private applyQueryParams(params: Params): void {
    if (!this.showAll() && params['showAll'] === 'true') {
      // The user has requested to show all containers
      this.showAll.set(true);
      if (this.categorySelectionStack().length > 0 || this.searchTerm()) {
        // If the user has selected a category or entered a search term, clear them when moving to show all
        this.clearSearch();
      }
    }

    const searchQuery: string = params['q'] ?? '';
    const categoryStack = searchQuery ? [] : this.resolveCategoryStack(params['c']);

    this.searchTerm.set(searchQuery);
    // Avoid a redundant signal write (and the effect run it would trigger) when the resolved
    // stack is equivalent to what's already set — array identity always differs otherwise.
    if (!arraysHaveSameElements(categoryStack, this.categorySelectionStack())) {
      this.categorySelectionStack.set(categoryStack);
    }
  }

  /**
   * Resolves a comma-separated `c` query param (a chain of category IDs from root to leaf)
   * into the matching stack of TermStanza objects.
   */
  private resolveCategoryStack(categoryParam: string | undefined): TermStanza[] {
    if (!categoryParam) {
      return [];
    }

    const categoryIds = categoryParam.split(',');
    const stack: TermStanza[] = [];

    let categoryId = categoryIds.shift();
    let category = this.rootCategories().find((root) => root.id === categoryId);
    if (!category) {
      console.error(`Category with id ${categoryId} not found in root`);
      return [];
    }
    stack.push(category);

    while (category && categoryIds.length > 0) {
      categoryId = categoryIds.shift();
      category = category.getChildren().find((child) => child.id === categoryId);
      if (category) {
        stack.push(category);
      } else {
        console.error(`Category with id ${categoryId} following hierarchy not found`);
      }
    }

    return stack;
  }

  /**
   * Creates the effect that syncs state signals back to the route's query parameters —
   * exactly once. It must run after the initial query params have been parsed into state
   * (otherwise it would immediately overwrite the URL with empty defaults), which is why it's
   * created here rather than in the constructor. `effect()` needs an injection context, which
   * this nested subscription callback isn't by default, hence `runInInjectionContext`.
   */
  private ensureRouteSyncEffect(): void {
    if (this.routeSyncEffectCreated) {
      return;
    }
    this.routeSyncEffectCreated = true;

    runInInjectionContext(this.envInjector, () => {
      effect(() => {
        this.updateRoute(this.showAll(), this.searchTerm(), this.categorySelectionStack());
      });
    });
  }

  /**
   * Updates the route based on the provided parameters.
   *
   * If `showAll` is true, it adds a `showAll` query parameter.
   * If `text` is provided, it adds a `q` query parameter with the text.
   * If `categorySelectionStack` is provided and not empty, it adds a `c` query parameter with the category IDs joined by commas.
   *
   * If no query parameters are added, it navigates to the base route.
   */
  private updateRoute(
    showAll: boolean,
    text: string,
    categorySelectionStack: TermStanza[],
  ): void {
    const queryParams: Params = {};

    if (showAll) {
      queryParams['showAll'] = true;
    }

    if (text) {
      queryParams['q'] = text;
    }

    if (categorySelectionStack.length > 0) {
      queryParams['c'] = categorySelectionStack.map((category) => category.id).join(',');
    }

    this.router.navigate([], { queryParams });
  }
}
