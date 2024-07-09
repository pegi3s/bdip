import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ContainerService } from "../../../../services/container.service";
import { TermStanza } from "../../../../obo/TermStanza";
import { ThemeService } from "../../../../services/theme.service";
import { AsyncPipe } from "@angular/common";
import { TabsComponent } from "../../../../shared/components/tabs/tabs.component";
import { ContainerIconComponent } from "../container-icon/container-icon.component";

@Component({
  selector: 'app-search-list',
  standalone: true,
  imports: [RouterLink, AsyncPipe, TabsComponent, ContainerIconComponent],
  templateUrl: './search-list.component.html',
  styleUrl: './search-list.component.css',
  host: { '[class.dark]': 'isDarkTheme()' },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchListComponent {
  /* Inputs */
  rootCategories = input<TermStanza[]>([]);
  selectedCategory = input<TermStanza>();
  name = input<string>('');

  private themeService: ThemeService = inject(ThemeService);
  protected isDarkTheme = signal<boolean>(false);

  private containerService: ContainerService = inject(ContainerService);
  containers = signal<Map<string, Set<string>>>(new Map<string, Set<string>>());

  /**
   * This computed property generates a set of container names that match the current search criteria sorted alphabetically.
   * If a name is provided, it searches for containers by name. If a specific category is selected,
   * it searches for containers within that category. If no specific category is selected, it searches
   * within all root categories. The search results are stored in a unique set to avoid duplicates.
   */
  matchedContainers = computed(() => {
    const matchedContainers = new Set<string>();
    if (this.name().length > 0) {
      this.getContainersByName(this.name(), matchedContainers);
    } else if (this.selectedCategory() !== undefined) {
      this.getContainersByCategory(this.selectedCategory()!, matchedContainers);
    } else {
      this.getContainersByCategories(this.rootCategories(), matchedContainers);
    }
    return [...matchedContainers].sort();
  });

  protected isCompact = signal<boolean>(true);

  constructor() {
    this.containerService.getContainersMap().subscribe((containers) => {
      this.containers.set(containers);
    });
    this.themeService.isDarkTheme().subscribe((isDark) => {
      this.isDarkTheme.set(isDark);
    });
  }

  getContainersByCategories(categories: TermStanza[], matchedContainers: Set<string>) {
    categories.forEach((category) => {
      this.getContainersByCategory(category, matchedContainers);
    });
  }

  getContainersByCategory(category: TermStanza, matchedContainers: Set<string>) {
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
   * Filters containers by checking if any container's name includes the specified 
   * name (case-insensitive) and adds matching containers to a set.
   * 
   * @param {string} name - The name to search for within container names.
   * @param {Set<string>} matchedContainers - The set to add matching containers to.
   */
  getContainersByName(name: string, matchedContainers: Set<string>) {
    this.containers().forEach((containerSet) => {
      containerSet.forEach((container) => {
        if (container.toLowerCase().includes(name.toLowerCase())) {
          matchedContainers.add(container);
        }
      });
    });
  }

  getContainerMetadataByName(name: string) {
    return this.containerService.getContainerMetadata(name);
  }

  onTabSelectedGridView(view: string) {
    this.isCompact.set(view === 'c');
  }
}
