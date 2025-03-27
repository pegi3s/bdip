import { Component, effect, inject, Signal, signal, TemplateRef, ViewContainerRef, viewChild } from "@angular/core";
import { OS } from '../../../../models/os';
import { UtilsService } from '../../../../services/utils.service';
import { TabsComponent } from '../../../../shared/components/tabs/tabs.component';
import { ThemeService } from '../../../../services/theme.service';
import { StepperComponent } from "../../../../shared/components/stepper/stepper.component";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { MarkdownComponent } from "ngx-markdown";
import { ClipboardButtonComponent } from "../../../../shared/components/clipboard-button/clipboard-button.component";
import { githubInfo } from "../../../../core/constants/github-info";
import { SoftwareRecommendationsService } from "../../../../services/software-recommendations.service";
import { TermStanza } from "../../../../obo/TermStanza";
import { LowerCasePipe } from "@angular/common";

@Component({
    selector: 'app-getting-started',
    templateUrl: './getting-started.component.html',
    styleUrl: './getting-started.component.css',
  imports: [TabsComponent, StepperComponent, MarkdownComponent, RouterLink, LowerCasePipe],
    host: { '[class.dark]': 'isDarkTheme()' }
})
export class GettingStartedComponent {
  /* Services */
  private readonly softwareRecommendationsService = inject(SoftwareRecommendationsService);
  private readonly utilsService: UtilsService = inject(UtilsService);
  private readonly themeService: ThemeService = inject(ThemeService);
  isDarkTheme: Signal<boolean>;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /* Fragments */
  readonly containerRef = viewChild.required('container', { read: ViewContainerRef });
  readonly installDockerTemplate = viewChild.required<TemplateRef<any>>('installDocker');
  readonly dockerManagerTemplate = viewChild.required<TemplateRef<any>>('dockerManager');
  readonly runCommandsGUITemplate = viewChild.required<TemplateRef<any>>('runCommandsGUI');
  readonly commonIssuesTemplate = viewChild.required<TemplateRef<any>>('commonIssues');
  readonly chooseSoftwareTemplate = viewChild.required<TemplateRef<any>>('chooseSoftware');
  protected steps = [
    { fragmentName: 'install-docker', name: 'Install Docker', icon: 'assets/icons/logos/docker-mark-blue.svg' },
    { fragmentName: 'manage-docker-images', name: 'Manage Docker Images', icon: 'assets/icons/octicons/container-24.svg' },
    { fragmentName: 'run-commands-gui', name: 'Run using a GUI', icon: 'assets/icons/fluent-icons/ic_fluent_window_console_20_filled.svg' },
    { fragmentName: 'common-issues', name: 'Common issues', icon: 'assets/icons/fluent-icons/ic_fluent_error_circle_24_filled.svg' },
    { fragmentName: 'choose-software', name: 'Choosing the right software', icon: 'assets/icons/fluent-icons/ic_fluent_apps_24_filled.svg' },
  ];
  readonly commonIssuesUrl = `https://raw.githubusercontent.com/${githubInfo.owner}/${githubInfo.repository}/${githubInfo.branch}/metadata/web/getting_started/common_issues.md`;

  readonly clipboardButton = ClipboardButtonComponent;

  /* Data */
  readonly softwareRecommendations = this.softwareRecommendationsService.softwareRecommendations;

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
    this.containerRef().clear();

    switch (fragment) {
      case 'install-docker':
        this.containerRef().createEmbeddedView(this.installDockerTemplate());
        break;
      case 'manage-docker-images':
        this.containerRef().createEmbeddedView(this.dockerManagerTemplate());
        break;
      case 'run-commands-gui':
        this.containerRef().createEmbeddedView(this.runCommandsGUITemplate());
        break;
      case 'common-issues':
        this.containerRef().createEmbeddedView(this.commonIssuesTemplate());
        break;
      case 'choose-software':
        this.containerRef().createEmbeddedView(this.chooseSoftwareTemplate());
        break;
      default:
        // Default to the first template if fragment is unrecognized
        this.containerRef().createEmbeddedView(this.installDockerTemplate());
    }
  }

  onTabSelectedGettingStarted(os: string) {
    this.gettingStartedOS = os as OS;
  }

  getIdHierarchy(category: TermStanza): string[] {
    // Base case: if no parents, return just this ID
    if (!category.hasParents()) {
      return [category.id];
    }

    // Get the hierarchy of the parents
    const parentIds = category.getParents().map(parent => this.getIdHierarchy(parent));
    return parentIds.flat().concat(category.id);
  }

  getNameHierarchy(category: TermStanza): string[] {
    // Base case: if no parents, return just this name
    if (!category.hasParents()) {
      return [category.name!.replaceAll("_", " ")];
    }

    // Get the hierarchy of the parents
    const parentNames = category.getParents().map(parent => this.getNameHierarchy(parent));
    return parentNames.flat().concat(category.name!.replaceAll("_", " "));
  }
}
