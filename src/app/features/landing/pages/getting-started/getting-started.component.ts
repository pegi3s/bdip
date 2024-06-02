import { Component, inject } from '@angular/core';
import { OS } from '../../../../models/os';
import { UtilsService } from '../../../../services/utils.service';
import { TabsComponent } from "../../../../shared/components/tabs/tabs.component";
import { ThemeService } from '../../../../services/theme.service';

@Component({
  selector: 'app-getting-started',
  standalone: true,
  templateUrl: './getting-started.component.html',
  styleUrl: './getting-started.component.css',
  imports: [TabsComponent],
  host: { '[class.dark]': 'isDarkTheme' }
})
export class GettingStartedComponent {
  /* Services */
  utilsService: UtilsService = inject(UtilsService);
  themeService: ThemeService = inject(ThemeService);
  isDarkTheme: boolean = false;

  /* State */
  gettingStartedOS: OS;

  /* Helpers */
  OS = OS;

  constructor() {
    this.gettingStartedOS = this.utilsService.getOS() as OS;
    this.themeService.isDarkTheme().subscribe(isDark => {
      this.isDarkTheme = isDark;
    });
  }

  onTabSelectedGettingStarted(os: string) {
    this.gettingStartedOS = os as OS;
  }
}
