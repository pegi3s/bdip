import { ChangeDetectionStrategy, Component, computed, inject, input, Signal, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ContainerService } from "../../../../services/container.service";
import { TermStanza } from "../../../../obo/TermStanza";
import { ThemeService } from "../../../../services/theme.service";
import { TabsComponent } from "../../../../shared/components/tabs/tabs.component";
import { ContainerIconComponent } from "../container-icon/container-icon.component";
import { ImageMetadata } from "../../../../models/image-metadata";
import { DockerHubImage } from "../../../../models/docker-hub-image";

@Component({
  selector: 'app-search-list',
  standalone: true,
  imports: [RouterLink, TabsComponent, ContainerIconComponent],
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

  private themeService: ThemeService = inject(ThemeService);
  protected isDarkTheme: Signal<boolean>;

  private containerService: ContainerService = inject(ContainerService);
  containers = signal<Map<string, Set<string>>>(new Map<string, Set<string>>());
  containersMetadata = signal<Map<string, ImageMetadata>>(new Map<string, ImageMetadata>());
  containersInfo = signal<Map<string, DockerHubImage>>(new Map<string, DockerHubImage>());

  /**
   * This computed property generates a set of container names that match the current search criteria sorted alphabetically.
   * If a name is provided, it searches for containers by name or description. If a specific category is selected,
   * it searches for containers within that category. If no specific category is selected, it searches
   * within all root categories. The search results are stored in a unique set to avoid duplicates.
   */
  matchedContainers = computed(() => {
    const matchedContainers = new Set<string>();
    if (this.searchQuery().length > 0) {
      this.getContainersByNameOrDescription(this.searchQuery(), matchedContainers);
    } else if (this.selectedCategory() !== undefined) {
      this.getContainersByCategory(this.selectedCategory()!, matchedContainers);
    } else {
      this.getContainersByCategories(this.rootCategories(), matchedContainers);
    }
    return [...matchedContainers].sort();
  });

  /**
   * Level of detail for the container list. If true, the list is compact.
   */
  protected isCompact = signal<boolean>(false);

  constructor() {
    this.containerService.getContainersMap().subscribe((containers) => {
      this.containers.set(containers);
    });
    this.containerService.getAllContainersMetadata().subscribe((metadata) => {
      this.containersMetadata.set(metadata);
    });
    this.containerService.getAllContainersInfo().subscribe((containersInfo) => {
      this.containersInfo.set(containersInfo);
    });
    this.isDarkTheme = this.themeService.isDarkTheme();
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
   * Filters containers by checking if any container's name or description includes
   * the specified name (case-insensitive) and adds matching containers to a set.
   *
   * @param {string} searchQuery - The query to search for in container names or descriptions.
   * @param {Set<string>} matchedContainers - The set to add matching containers to.
   */
  getContainersByNameOrDescription(searchQuery: string, matchedContainers: Set<string>) {
    const queryLowerCase = searchQuery.toLowerCase();
    this.containers().forEach((containerSet) => {
      containerSet.forEach((container) => {
        if (container.toLowerCase().includes(queryLowerCase)) {
          matchedContainers.add(container);
        }
      });
    });
    this.containersMetadata().forEach((metadata) => {
      if (metadata.description.toLowerCase().includes(queryLowerCase)) {
        matchedContainers.add(metadata.name);
      }
    });
  }

  getContainerMetadataByName(name: string): ImageMetadata | undefined {
    return this.containersMetadata().get(name);
  }

  isContainerNew(name: string): boolean {
    const creationDate = Date.parse(this.containersInfo().get(name)?.date_registered ?? '0');
    const daysSinceCreation = Math.floor((Date.now() - creationDate) / (1000 * 60 * 60 * 24));
    return daysSinceCreation <= 30;
  }

  wasContainerRecentlyUpdated(name: string): boolean {
    const creationDate = Date.parse(this.containersInfo().get(name)?.last_updated ?? '0');
    const daysSinceCreation = Math.floor((Date.now() - creationDate) / (1000 * 60 * 60 * 24));
    return daysSinceCreation <= 30;
  }

  onTabSelectedGridView(view: string) {
    this.isCompact.set(view === 'c');
  }
}
