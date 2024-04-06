import { Component, inject } from '@angular/core';
import { ContainerService } from '../services/container.service';
import { TermStanza } from '../obo/TermStanza';
import { OntologyEditorElementComponent } from '../ontology-editor-element/ontology-editor-element.component';

@Component({
  selector: 'app-ontology-editor',
  standalone: true,
  templateUrl: './ontology-editor.component.html',
  styleUrl: './ontology-editor.component.css',
  imports: [OntologyEditorElementComponent],
})
export class OntologyEditorComponent {
  containerService: ContainerService = inject(ContainerService);
  rootCategories: TermStanza[] = [];
  categories: TermStanza[] = [];
  containers: Map<string, Set<string>> = new Map<string, Set<string>>();

  ngOnInit() {
    console.log('Loading categories...');
    this.containerService.getOntology().subscribe((ontology) => {
      const roots = ontology
        .getOntology()
        ?.filter((term) => term.hasParents() === false);
      console.log(roots);
      roots?.forEach((root) => {
        this.rootCategories.push(root);
        this.categories.push(root);
      });
    });
    console.log('Categories loaded.');
    console.log(this.categories);
    this.containerService.getContainersMap().subscribe((containers) => {
      console.log('Containers loaded.');
      this.containers = containers;
    });
  }

  save() {
    console.log('Save');
  }
}
