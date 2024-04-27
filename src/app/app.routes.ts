import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { SearchListComponent } from './search-list/search-list.component';
import { EmptyComponent } from './empty/empty.component';
import { OntologyEditorComponent } from './ontology-editor/ontology-editor.component';
import { ContainerComponent } from './container/container.component';

export const routes: Routes = [
    {
        path: '',
        title: 'Bioinformatics Docker Images Project',
        component: EmptyComponent,
    },
    {
        path: 'about',
        title: 'Bioinformatics Docker Images Project',
        component: LandingComponent,
    },
    {
        path: 'containers',
        component: SearchListComponent,
    },
    {
        path: 'container/:name',
        component: ContainerComponent,
    },
    {
        path: 'edit-ontology',
        component: OntologyEditorComponent,
    },
];
