import { ChangeDetectionStrategy, Component, computed, effect, inject, input, Signal, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ContainerService } from "../../../../services/container.service";
import { TermStanza } from "../../../../obo/TermStanza";
import { ThemeService } from "../../../../services/theme.service";
import { TabsComponent } from "../../../../shared/components/tabs/tabs.component";
import { ContainerIconComponent } from "../container-icon/container-icon.component";
import { ImageMetadata } from "../../../../models/image-metadata";
import { DropdownComponent } from "../../../../shared/components/dropdown/dropdown.component";
import { IconDropdownComponent } from "../../../../shared/components/icon-dropdown/icon-dropdown.component";

/** A container counts as "new"/"recently updated" within this many days. */
const RECENCY_THRESHOLD_DAYS = 30;

interface SortOption {
  name: string;
  value: string;
  icon: string;
  reverse?: boolean;
}

interface FilterOption {
  name: string;
  value: string;
}

@Component({
  selector: 'app-search-list',
  imports: [RouterLink, TabsComponent, ContainerIconComponent, DropdownComponent, IconDropdownComponent],
  templateUrl: './search-list.component.html',
  styleUrl: './search-list.component.css',
  host: { '[class.dark]': 'isDarkTheme()' },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchListComponent {
  /* Inputs */
  rootCategories = input<TermStanza[]>([]);
  selectedCategory = input<TermStanza>();
  searchQuery = input<string>('');
  searchReadmes = input<boolean>(false);

  private readonly themeService = inject(ThemeService);
  protected readonly isDarkTheme: Signal<boolean> = this.themeService.isDarkTheme;

  private readonly containerService = inject(ContainerService);
  protected readonly containers = this.containerService.getContainersMapRes().value;
  protected readonly containersMetadata = this.containerService.getAllContainersMetadataRes().value;
  protected readonly containersInfo = this.containerService.getAllContainersInfoRes().value;
  protected readonly containerReadmes = this.containerService.getContainersReadmesRes().value;

  /**
   * This computed property generates a set of container names that match the current search criteria sorted alphabetically.
   * If a name is provided, it searches for containers by name or description. If a specific category is selected,
   * it searches for containers within that category. If no specific category is selected, it searches
   * within all root categories. The search results are stored in a unique set to avoid duplicates.
   */
  protected readonly matchedContainers = computed(() => {
    const matchedContainers = new Set<string>();
    if (this.searchQuery().length > 0) {
      this.getContainersByNameOrDescription(this.searchQuery(), matchedContainers);
    } else if (this.selectedCategory() !== undefined) {
      this.getContainersByCategory(this.selectedCategory()!, matchedContainers);
    } else {
      this.getContainersByCategories(this.rootCategories(), matchedContainers);
    }

    if (this.sortOptions[this.selectedSortOption()].value === 'name') {
      const sortedContainers = [...matchedContainers].sort();
      return this.sortOptions[this.selectedSortOption()].reverse ? sortedContainers.reverse() : sortedContainers;
    }

    return [...matchedContainers];
  });

  /**
   * Level of detail for the container list. If true, the list is compact.
   */
  protected readonly isCompact = signal<boolean>(false);

  /** Sorting options for the container list. */
  protected readonly sortOptions: SortOption[] = [
    { name: 'Name: A-Z', value: 'name', icon: 'assets/icons/fluent-icons/ic_fluent_text_sort_ascending_24_regular.svg' },
    { name: 'Name: Z-A', value: 'name', reverse: true, icon: 'assets/icons/fluent-icons/ic_fluent_text_sort_descending_24_regular.svg' },
  ];
  protected readonly selectedSortOption = signal<number>(0);

  /** Filter options for the container list. */
  protected readonly filterOptions: FilterOption[] = [
    { name: 'Only show new', value: 'new' },
    { name: 'Only show updated', value: 'updated' },
    { name: 'Hide unusable', value: 'hide-unusable' },
  ];
  protected readonly selectedFilterOption = signal<number>(-1);

  constructor() {
    effect(() => {
      if (this.searchReadmes()) {
        this.containerService.enableReadmes();
      }
    });
  }

  private getContainersByCategories(categories: TermStanza[], matchedContainers: Set<string>): void {
    categories.forEach((category) => {
      this.getContainersByCategory(category, matchedContainers);
    });
  }

  private getContainersByCategory(category: TermStanza, matchedContainers: Set<string>): void {
    if (!category.hasChildren()) {
      this.containers().get(category.id)?.forEach((container) => {
        matchedContainers.add(container);
      });
    } else {
      category.getChildren().forEach((child) => {
        this.getContainersByCategory(child, matchedContainers);
      });
    }
  }

  /**
   * Filters containers by checking if their name, description, or README content match the
   * given search query (case-insensitive). Supports both partial and exact (quoted) terms.
   *
   * - Unquoted terms are matched as case-insensitive substrings (e.g., `mega` matches `megax` and `omegamap`).
   * - Quoted terms (e.g., `"mega"`) are matched as exact words or phrases, using word boundaries
   *   (e.g., `"mega"` matches `mega`, but not `megax` or `omegamap`).
   *
   * A container is considered a match if all quoted phrases and all unquoted terms
   * appear in either the container's name, description, or README content.
   *
   * @param {string} searchQuery - The query string, which may include quoted exact terms and unquoted partial terms.
   * @param {Set<string>} matchedContainers - The set to add matching container names to.
   */
  private getContainersByNameOrDescription(searchQuery: string, matchedContainers: Set<string>): void {
    const exactPhrases: string[] = [];
    const partialTerms: string[] = [];
    // Split the search query into exact and partial terms
    // Regex: anything inside double quotes OR one or more non-whitespace characters
    const regex = /"([^"]+)"|(\S+)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(searchQuery)) !== null) {
      if (match[1]) exactPhrases.push(match[1].toLowerCase());
      else if (match[2]) partialTerms.push(match[2].toLowerCase());
    }

    const matchesQuery = (text: string) => {
      const lower = text.toLowerCase();
      // Match if all partial terms appear as substrings (loose match)
      const allTermsMatch = partialTerms.every(term => lower.includes(term));
      // Match if all quoted phrases appear exactly (word-boundary match)
      const allPhrasesMatch = exactPhrases.every(phrase => {
        const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex
        const pattern = new RegExp(`\\b${escaped}\\b`, 'i'); // Word-boundary match, case-insensitive
        return pattern.test(text);
      });

      return allTermsMatch && allPhrasesMatch;
    };

    this.containers().forEach((containerSet) => {
      containerSet.forEach((container) => {
        if (matchesQuery(container)) {
          matchedContainers.add(container);
        }
      });
    });
    this.containersMetadata().forEach((metadata) => {
      if (matchesQuery(metadata.description)) {
        matchedContainers.add(metadata.name);
      }
    });
    if (this.searchReadmes()) {
      this.containerReadmes().forEach((readme, container) => {
        if (matchesQuery(readme)) {
          matchedContainers.add(container);
        }
      });
    }
  }

  protected getContainerMetadataByName(name: string): ImageMetadata | undefined {
    return this.containersMetadata().get(name);
  }

  protected isContainerNew(name: string): boolean {
    return this.isWithinRecencyThreshold(this.containersInfo().get(name)?.date_registered);
  }

  protected wasContainerRecentlyUpdated(name: string): boolean {
    return this.isWithinRecencyThreshold(this.containersInfo().get(name)?.last_updated);
  }

  private isWithinRecencyThreshold(dateString: string | undefined): boolean {
    const timestamp = Date.parse(dateString ?? '0');
    const daysSince = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    return daysSince <= RECENCY_THRESHOLD_DAYS;
  }

  protected onTabSelectedGridView(view: string): void {
    this.isCompact.set(view === 'c');
  }
}
