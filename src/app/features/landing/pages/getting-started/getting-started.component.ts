import { Component, effect, inject, Signal, signal, TemplateRef, ViewChild, ViewContainerRef } from "@angular/core";
import { OS } from '../../../../models/os';
import { UtilsService } from '../../../../services/utils.service';
import { TabsComponent } from '../../../../shared/components/tabs/tabs.component';
import { ThemeService } from '../../../../services/theme.service';
import { StepperComponent } from "../../../../shared/components/stepper/stepper.component";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'app-getting-started',
  standalone: true,
  templateUrl: './getting-started.component.html',
  styleUrl: './getting-started.component.css',
  imports: [TabsComponent, StepperComponent],
  host: { '[class.dark]': 'isDarkTheme()' },
})
export class GettingStartedComponent {
  /* Services */
  private utilsService: UtilsService = inject(UtilsService);
  private themeService: ThemeService = inject(ThemeService);
  isDarkTheme: Signal<boolean>;
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /* Fragments */
  @ViewChild('container', { read: ViewContainerRef, static: true }) containerRef!: ViewContainerRef;
  @ViewChild('installDocker') installDockerTemplate!: TemplateRef<any>;
  @ViewChild('dockerManager') dockerManagerTemplate!: TemplateRef<any>;
  @ViewChild('runCommands') runCommandsTemplate!: TemplateRef<any>;
  protected steps = [
    { fragmentName: 'install-docker', name: 'Install Docker', icon: 'assets/icons/logos/docker-mark-blue.svg' },
    { fragmentName: 'manage-docker-images', name: 'Manage Docker Images', icon: 'assets/icons/octicons/container-24.svg' },
    { fragmentName: 'run-commands', name: 'Run commands', icon: 'assets/icons/fluent-icons/ic_fluent_window_console_20_filled.svg' }
  ];

  /* State */
  currentStep = signal(0);
  gettingStartedOS: OS;

  /* Helpers */
  OS = OS;

  constructor() {
    this.gettingStartedOS = this.utilsService.getOS() as OS;
    this.isDarkTheme = this.themeService.isDarkTheme();

    effect(() => {
      const fragment = this.steps[this.currentStep()].fragmentName;
      this.router.navigate([], { fragment });
      this.loadTemplateBasedOnFragment(fragment);
    });
  }

  ngOnInit() {
    this.route.fragment.subscribe(fragment => {
      const stepIndex = this.steps.findIndex(step => step.fragmentName === fragment);
      this.currentStep.set(stepIndex === -1 ? 0 : stepIndex);
    });
  }

  private loadTemplateBasedOnFragment(fragment: string | null) {
    // Clear the current container to avoid duplicate templates
    this.containerRef.clear();

    switch (fragment) {
      case 'install-docker':
        this.containerRef.createEmbeddedView(this.installDockerTemplate);
        break;
      case 'manage-docker-images':
        this.containerRef.createEmbeddedView(this.dockerManagerTemplate);
        break;
      case 'run-commands':
        this.containerRef.createEmbeddedView(this.runCommandsTemplate);
        break;
      default:
        // Default to the first template if fragment is unrecognized
        this.containerRef.createEmbeddedView(this.installDockerTemplate);
    }
  }

  onTabSelectedGettingStarted(os: string) {
    this.gettingStartedOS = os as OS;
  }
}
