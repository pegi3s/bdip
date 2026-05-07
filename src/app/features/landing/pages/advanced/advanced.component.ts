import { ChangeDetectionStrategy, Component, effect, inject, Signal, signal, TemplateRef, ViewContainerRef, viewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { httpResource } from "@angular/common/http";
import { MarkdownComponent } from "ngx-markdown";
import { ClipboardButtonComponent } from "../../../../shared/components/clipboard-button/clipboard-button.component";
import { githubInfo } from "../../../../core/constants/github-info";
import { StepperComponent } from "../../../../shared/components/stepper/stepper.component";
import { ThemeService } from "../../../../services/theme.service";
import { ReplacePipe } from "../../../../shared/pipes/replace/replace.pipe";

@Component({
    selector: 'app-advanced',
    templateUrl: './advanced.component.html',
    styleUrl: './advanced.component.css',
    imports: [StepperComponent, MarkdownComponent, ReplacePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { '[class.dark]': 'isDarkTheme()' }
})
export class AdvancedComponent {
  /* Services */
  private readonly themeService = inject(ThemeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  isDarkTheme: Signal<boolean>;

  /* Fragments */
  readonly containerRef = viewChild.required('container', { read: ViewContainerRef });
  readonly dockerManagerTemplate = viewChild.required<TemplateRef<unknown>>('dockerManager');
  readonly dockviewTemplate = viewChild.required<TemplateRef<unknown>>('dockview');

  protected steps = [
    { fragmentName: 'manage-docker-images', name: 'Manage Docker Images', icon: 'assets/icons/octicons/container-24.svg' },
    { fragmentName: 'monitoring-docker-images', name: 'Monitoring Docker Images', icon: 'assets/icons/fluent-icons/ic_fluent_pulse_square_24_filled.svg' },
  ];

  readonly advancedMdBaseUrl = `https://raw.githubusercontent.com/${githubInfo.owner}/${githubInfo.repository}/${githubInfo.branch}/metadata/web/advanced`;
  readonly dockerManagerMd = httpResource.text(
    () => `${this.advancedMdBaseUrl}/manage-docker-images.md`,
    {
      parse: (response: string) => this.setMarkdownBaseUrl(response, this.advancedMdBaseUrl),
      defaultValue: ""
    }
  );
  readonly dockviewMd = httpResource.text(
    () => `${this.advancedMdBaseUrl}/dockview.md`,
    {
      parse: (response: string) => this.setMarkdownBaseUrl(response, this.advancedMdBaseUrl),
      defaultValue: ""
    }
  );

  readonly clipboardButton = ClipboardButtonComponent;

  /* State */
  currentStep = signal(0);

  constructor() {
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
      case 'manage-docker-images':
        this.containerRef().createEmbeddedView(this.dockerManagerTemplate());
        break;
      case 'monitoring-docker-images':
        this.containerRef().createEmbeddedView(this.dockviewTemplate());
        break;
      default:
        // Default to the first template if fragment is unrecognized
        this.containerRef().createEmbeddedView(this.dockerManagerTemplate());
    }
  }

  setMarkdownBaseUrl(content: string, baseUrl: string): string {
    // Ensure baseUrl ends with a trailing slash
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';

    // Replace image sources in HTML
    content = content.replace(/<img\s+[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi,
      (match, src) => match.replace(src, this.convertToAbsoluteUrl(src, normalizedBaseUrl)));

    // Replace href attributes in HTML anchors
    content = content.replace(/<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi,
      (match, href) => match.replace(href, this.convertToAbsoluteUrl(href, normalizedBaseUrl)));

    // Replace image sources in Markdown
    content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/gi,
      (match, alt, src) => `![${alt}](${this.convertToAbsoluteUrl(src, normalizedBaseUrl)})`);

    // Replace links in Markdown
    content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/gi,
      (match, text, url) => `[${text}](${this.convertToAbsoluteUrl(url, normalizedBaseUrl)})`);

    return content;
  };

  private convertToAbsoluteUrl(url: string, baseUrl: string): string {
    // Skip URLs that are already absolute
    if (url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('//') ||
      url.startsWith('mailto:') ||
      url.startsWith('tel:') ||
      url.startsWith('#')) {
      return url;
    }

    // Remove leading slash if present
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return baseUrl + cleanUrl;
  }
}