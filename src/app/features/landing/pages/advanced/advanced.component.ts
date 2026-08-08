import { Component, effect, inject, Signal, signal, TemplateRef, ViewContainerRef, viewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { httpResource } from "@angular/common/http";
import { MarkdownComponent } from "ngx-markdown";
import { ClipboardButtonComponent } from "../../../../shared/components/clipboard-button/clipboard-button.component";
import { githubInfo } from "../../../../core/constants/github-info";
import { StepperComponent } from "../../../../shared/components/stepper/stepper.component";
import { ThemeService } from "../../../../services/theme.service";
import { ReplacePipe } from "../../../../shared/pipes/replace/replace.pipe";
import { setMarkdownBaseUrl } from "../../../../shared/utils/markdown-base-url";

@Component({
  selector: 'app-advanced',
  templateUrl: './advanced.component.html',
  styleUrl: './advanced.component.css',
  imports: [StepperComponent, MarkdownComponent, ReplacePipe],
  host: { '[class.dark]': 'isDarkTheme()' }
})
export class AdvancedComponent {
  /* Services */
  private readonly themeService = inject(ThemeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly isDarkTheme: Signal<boolean> = this.themeService.isDarkTheme;

  /* Fragments */
  readonly containerRef = viewChild.required('container', { read: ViewContainerRef });
  readonly dockerManagerTemplate = viewChild.required<TemplateRef<unknown>>('dockerManager');
  readonly dockviewTemplate = viewChild.required<TemplateRef<unknown>>('dockview');
  readonly contributeTemplate = viewChild.required<TemplateRef<unknown>>('contribute');

  protected steps = [
    { fragmentName: 'manage-docker-images', name: 'Manage Docker Images', icon: 'assets/icons/octicons/container-24.svg' },
    { fragmentName: 'monitoring-docker-images', name: 'Monitoring Docker Images', icon: 'assets/icons/fluent-icons/ic_fluent_pulse_square_24_filled.svg' },
    { fragmentName: 'contribute-docker-images', name: 'Contribute New Docker Images', icon: 'assets/icons/fluent-icons/ic_fluent_people_community_24_filled.svg' },
  ];

  private readonly advancedMdBaseUrl = `https://raw.githubusercontent.com/${githubInfo.owner}/${githubInfo.repository}/${githubInfo.branch}/metadata/web/advanced`;

  readonly dockerManagerMd = this.loadMarkdown('manage-docker-images.md');
  readonly dockviewMd = this.loadMarkdown('dockview.md');
  readonly contributeMd = this.loadMarkdown('contribute.md');

  protected readonly clipboardButton = ClipboardButtonComponent;

  /* State */
  protected currentStep = signal(0);

  constructor() {
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
      () => `${this.advancedMdBaseUrl}/${filename}`,
      {
        parse: (response: string) => setMarkdownBaseUrl(response, this.advancedMdBaseUrl),
        defaultValue: "",
      },
    );
  }

  private loadTemplateBasedOnFragment(fragment: string | null) {
    // Clear the current container to avoid duplicate templates
    this.containerRef().clear();

    switch (fragment) {
      case 'manage-docker-images':
        this.containerRef().createEmbeddedView(this.dockerManagerTemplate());
        break;
      case 'monitoring-docker-images':
        this.containerRef().createEmbeddedView(this.dockviewTemplate());
        break;
      case 'contribute-docker-images':
        this.containerRef().createEmbeddedView(this.contributeTemplate());
        break;
      default:
        // Default to the first template if fragment is unrecognized
        this.containerRef().createEmbeddedView(this.dockerManagerTemplate());
    }
  }
}
