import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { SearchListComponent } from './search-list/search-list.component';
import { EmptyComponent } from './empty/empty.component';
import { OntologyEditorComponent } from './ontology-editor/ontology-editor.component';
import { ContainerComponent } from './container/container.component';
import { TutorialComponent } from './tutorial/tutorial.component';
import { TutorialsLandingComponent } from './tutorials-landing/tutorials-landing.component';
import { SearchGuidedComponent } from './search-guided/search-guided.component';

export const routes: Routes = [
    {
        path: '',
        title: 'Bioinformatics Docker Images Project',
        component: LandingComponent,
    },
    {
        path: 'about',
        title: 'Bioinformatics Docker Images Project',
        component: LandingComponent,
    },
    {
        path: 'search',
        component: SearchGuidedComponent,
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
        path: 'tutorials',
        component: TutorialsLandingComponent,
    },
    {
        path: 'tutorials/:name',
        component: TutorialComponent,
    },
    {
        path: 'edit-ontology',
        component: OntologyEditorComponent,
    },
];
