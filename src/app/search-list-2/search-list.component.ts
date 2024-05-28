import { Component, Input, OnChanges, SimpleChanges, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ContainerService } from "../services/container.service";
import { Ontology } from "../obo/Ontology";
import { TermStanza } from "../obo/TermStanza";
import { ThemeService } from "../services/theme.service";

@Component({
  selector: 'app-search-list-2',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './search-list.component.html',
  styleUrl: './search-list.component.css',
  host: { '[class.dark]': 'isDarkTheme' }
})
export class SearchListComponent2 implements OnChanges {
  category = input<TermStanza>();
  name = input<string>('');

  private themeService: ThemeService = inject(ThemeService);
  protected isDarkTheme: boolean = false;

  containerService: ContainerService = inject(ContainerService);
  ontology?: Ontology;
  containers: Map<string, Set<string>> = new Map<string, Set<string>>();

  matchedContainers: Set<string> = new Set<string>();

  constructor() {
    this.containerService.getOntology(false).subscribe((ontology) => {
      this.ontology = ontology;
    });
    this.containerService.getContainersMap().subscribe((containers) => {
      this.containers = containers;
    });
    this.themeService.isDarkTheme().subscribe((isDark) => {
      this.isDarkTheme = isDark;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["category"] && !changes["category"].firstChange) {
      this.matchedContainers.clear();
      if (this.category() !== undefined) {
        this.getContainersByCategory(this.category()!);
      }
    }
    if (changes["name"] && !changes["name"].firstChange) {
      this.matchedContainers.clear();
      if (this.name().length > 0) {
        this.getContainersByName(this.name());
      }
    }
  }

  getContainersByCategory(category: TermStanza) {
    if (!category.hasChildren()) {
      this.containers.get(category.id)?.forEach((container) => {
        this.matchedContainers.add(container);
      });
    } else {
      category.getChildren().forEach((child) => {
        this.getContainersByCategory(child);
      });
    }
  }

  getContainersByName(name: string) {
    this.containers.forEach((containerSet) => {
      containerSet.forEach((container) => {
        if (container.includes(name)) {
          this.matchedContainers.add(container);
        }
      });
    });
  }
}
