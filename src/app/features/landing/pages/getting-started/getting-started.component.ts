import { Component, inject, Signal, signal } from "@angular/core";
import { OS } from '../../../../models/os';
import { UtilsService } from '../../../../services/utils.service';
import { TabsComponent } from '../../../../shared/components/tabs/tabs.component';
import { ThemeService } from '../../../../services/theme.service';
import { StepperComponent } from "../../../../shared/components/stepper/stepper.component";
import { NgTemplateOutlet } from "@angular/common";

@Component({
  selector: 'app-getting-started',
  standalone: true,
  templateUrl: './getting-started.component.html',
  styleUrl: './getting-started.component.css',
  imports: [TabsComponent, StepperComponent, NgTemplateOutlet],
  host: { '[class.dark]': 'isDarkTheme()' },
})
export class GettingStartedComponent {
  /* Services */
  private utilsService: UtilsService = inject(UtilsService);
  private themeService: ThemeService = inject(ThemeService);
  isDarkTheme: Signal<boolean>;

  /* State */
  currentStep = signal(0);
  gettingStartedOS: OS;

  /* Helpers */
  OS = OS;

  constructor() {
    this.gettingStartedOS = this.utilsService.getOS() as OS;
    this.isDarkTheme = this.themeService.isDarkTheme();
  }

  onTabSelectedGettingStarted(os: string) {
    this.gettingStartedOS = os as OS;
  }
}
