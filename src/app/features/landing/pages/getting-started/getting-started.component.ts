import { Component, effect, inject, Signal, signal, TemplateRef, ViewContainerRef, viewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
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
import { LowerCasePipe } from "@angular/common";
import { httpResource } from "@angular/common/http";
import { setMarkdownBaseUrl } from "../../../../shared/utils/markdown-base-url";
import { getIdHierarchy, getNameHierarchy } from "../../../../shared/utils/term-stanza-hierarchy";

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
  private readonly utilsService = inject(UtilsService);
  private readonly themeService = inject(ThemeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly isDarkTheme: Signal<boolean> = this.themeService.isDarkTheme;

  /* Fragments */
  readonly containerRef = viewChild.required('container', { read: ViewContainerRef });
  readonly installDockerTemplate = viewChild.required<TemplateRef<unknown>>('installDocker');
  readonly runCommandsGUITemplate = viewChild.required<TemplateRef<unknown>>('runCommandsGUI');
  readonly commonIssuesTemplate = viewChild.required<TemplateRef<unknown>>('commonIssues');
  readonly chooseSoftwareTemplate = viewChild.required<TemplateRef<unknown>>('chooseSoftware');
  protected steps = [
    { fragmentName: 'install-docker', name: 'Install Docker', icon: 'assets/icons/logos/docker-mark-blue.svg' },
    { fragmentName: 'run-commands-gui', name: 'Run using a GUI', icon: 'assets/icons/fluent-icons/ic_fluent_window_console_20_filled.svg' },
    { fragmentName: 'common-issues', name: 'Common issues', icon: 'assets/icons/fluent-icons/ic_fluent_error_circle_24_filled.svg' },
    { fragmentName: 'choose-software', name: 'Choosing the right software', icon: 'assets/icons/fluent-icons/ic_fluent_apps_24_filled.svg' },
  ];

  private readonly gettingStartedMdBaseUrl = `https://raw.githubusercontent.com/${githubInfo.owner}/${githubInfo.repository}/${githubInfo.branch}/metadata/web/getting_started`;

  readonly runCommandsGUIMd = this.loadMarkdown('run-commands-gui.md');
  readonly commonIssuesMd = this.loadMarkdown('common_issues.md');

  protected readonly clipboardButton = ClipboardButtonComponent;

  /* Data */
  protected readonly softwareRecommendations = this.softwareRecommendationsService.softwareRecommendations;

  /* State */
  protected currentStep = signal(0);
  protected gettingStartedOS: OS;

  /* Helpers */
  protected readonly OS = OS;

  constructor() {
    this.gettingStartedOS = this.utilsService.getOS() as OS;

    effect(() => {
      const fragment = this.steps[this.currentStep()].fragmentName;
      this.router.navigate([], { fragment });
      this.loadTemplateBasedOnFragment(fragment);
    });

    this.route.fragment.pipe(takeUntilDestroyed()).subscribe(fragment => {
      const stepIndex = this.steps.findIndex(step => step.fragmentName === fragment);
      this.currentStep.set(stepIndex === -1 ? 0 : stepIndex);
    });
  }

  private loadMarkdown(filename: string) {
    return httpResource.text(
      () => `${this.gettingStartedMdBaseUrl}/${filename}`,
      {
        parse: (response: string) => setMarkdownBaseUrl(response, this.gettingStartedMdBaseUrl),
        defaultValue: "",
      },
    );
  }

  private loadTemplateBasedOnFragment(fragment: string | null) {
    // Clear the current container to avoid duplicate templates
    this.containerRef().clear();

    switch (fragment) {
      case 'install-docker':
        this.containerRef().createEmbeddedView(this.installDockerTemplate());
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

  protected onTabSelectedGettingStarted(os: string): void {
    this.gettingStartedOS = os as OS;
  }

  protected readonly getIdHierarchy = getIdHierarchy;
  protected readonly getNameHierarchy = getNameHierarchy;
}
