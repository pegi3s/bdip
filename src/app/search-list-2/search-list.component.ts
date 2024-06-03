import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ContainerService } from "../services/container.service";
import { TermStanza } from "../obo/TermStanza";
import { ThemeService } from "../services/theme.service";

@Component({
  selector: 'app-search-list-2',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './search-list.component.html',
  styleUrl: './search-list.component.css',
  host: { '[class.dark]': 'isDarkTheme' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchListComponent2 {
  /* Inputs */
  rootCategories = input<TermStanza[]>([]);
  selectedCategory = input<TermStanza>();
  name = input<string>('');

  private themeService: ThemeService = inject(ThemeService);
  protected isDarkTheme: boolean = false;

  containerService: ContainerService = inject(ContainerService);
  containers: Map<string, Set<string>> = new Map<string, Set<string>>();

  matchedContainers = computed(() => {
    const matchedContainers = new Set<string>();
    if (this.name().length > 0) {
      this.getContainersByName(this.name(), matchedContainers);
    } else if (this.selectedCategory() !== undefined) {
      this.getContainersByCategory(this.selectedCategory()!, matchedContainers);
    } else {
      this.getContainersByCategories(this.rootCategories(), matchedContainers);
    }
    return matchedContainers;
  });

  constructor() {
    this.containerService.getContainersMap().subscribe((containers) => {
      this.containers = containers;
    });
    this.themeService.isDarkTheme().subscribe((isDark) => {
      this.isDarkTheme = isDark;
    });
  }

  getContainersByCategories(categories: TermStanza[], matchedContainers: Set<string>) {
    categories.forEach((category) => {
      this.getContainersByCategory(category, matchedContainers);
    });
  }

  getContainersByCategory(category: TermStanza, matchedContainers: Set<string>) {
    if (!category.hasChildren()) {
      this.containers.get(category.id)?.forEach((container) => {
        matchedContainers.add(container);
      });
    } else {
      category.getChildren().forEach((child) => {
        this.getContainersByCategory(child, matchedContainers);
      });
    }
  }

  getContainersByName(name: string, matchedContainers: Set<string>) {
    this.containers.forEach((containerSet) => {
      containerSet.forEach((container) => {
        if (container.toLowerCase().includes(name.toLowerCase())) {
          matchedContainers.add(container);
        }
      });
    });
  }
}