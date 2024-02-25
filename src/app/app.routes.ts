import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { SearchListComponent } from './search-list/search-list.component';
import { EmptyComponent } from './empty/empty.component';

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
];
