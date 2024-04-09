import { Component, inject } from '@angular/core';
import { ContainerService } from '../services/container.service';
import { TermStanza } from '../obo/TermStanza';
import { OntologyEditorElementComponent } from '../ontology-editor-element/ontology-editor-element.component';
import { Ontology } from '../obo/Ontology';

@Component({
  selector: 'app-ontology-editor',
  standalone: true,
  templateUrl: './ontology-editor.component.html',
  styleUrl: './ontology-editor.component.css',
  imports: [OntologyEditorElementComponent],
})
export class OntologyEditorComponent {
  containerService: ContainerService = inject(ContainerService);
  ontology?: Ontology;
  rootCategories: TermStanza[] = [];
  categories: TermStanza[] = [];
  containers: Map<string, Set<string>> = new Map<string, Set<string>>();

  ngOnInit() {
    console.log('Loading categories...');
    this.containerService.getOntology().subscribe((ontology) => {
      this.ontology = ontology;
      // TODO: Check if the ontology returned is shared between subscribers. If so, do the following
      // this.ontology = structuredClone(ontology);
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

  save(): void {
    if (this.ontology != null) {
      const file = this.ontology.toOBOFile();
      const url = URL.createObjectURL(file);

      // Create an anchor element with the generated URL and programmatically click it to force the download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dio.obo';
      a.click();

      URL.revokeObjectURL(url);
    }
  }
}
