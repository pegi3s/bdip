import { Component, effect, inject, Injector, runInInjectionContext, signal, Signal } from "@angular/core";
import { DockerHubImage } from '../../../../models/docker-hub-image';
import { DockerHubTag } from '../../../../models/docker-hub-tag';
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ContainerService } from '../../../../services/container.service';
import { MarkdownModule } from 'ngx-markdown';
import { DatePipe, NgTemplateOutlet, SlicePipe, ViewportScroller } from "@angular/common";
import { ThemeService } from '../../../../services/theme.service';
import { ClipboardButtonComponent } from '../../../../shared/components/clipboard-button/clipboard-button.component';
import { TabsComponent } from "../../../../shared/components/tabs/tabs.component";
import { BytesToSizePipe } from "../../../../shared/pipes/bytes-to-size/bytes-to-size.pipe";
import { SvgIconComponent } from 'angular-svg-icon';
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";
import { ImageMetadata } from "../../../../models/image-metadata";
import { TermStanza } from "../../../../obo/TermStanza";
import { DockerfileService } from "../../../../services/dockerfile.service";
import { DropdownComponent } from "../../../../shared/components/dropdown/dropdown.component";
import { RelatedSoftware } from "../../../../models/related-software";

@Component({
    selector: 'app-container',
    templateUrl: './container.component.html',
    styleUrl: './container.component.css',
    host: { '[class.dark]': 'isDarkTheme()' },
  imports: [DatePipe, SlicePipe, MarkdownModule, TabsComponent, BytesToSizePipe, ClipboardButtonComponent, SvgIconComponent, LoadingComponent, NgTemplateOutlet, RouterLink, DropdownComponent]
})
export class ContainerComponent {
  /* Services */
  private readonly injector = inject(Injector);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private viewportScroller = inject(ViewportScroller);
  private containerService: ContainerService = inject(ContainerService);
  private dockerfileService = inject(DockerfileService);
  private themeService: ThemeService = inject(ThemeService);
  isDarkTheme: Signal<boolean>;

  readonly clipboardButton = ClipboardButtonComponent;

  status: Status = Status.LOADING;
  container?: DockerHubImage;
  containerTags: Signal<DockerHubTag[]> = signal([]);
  ontologyCategories: Signal<TermStanza[][]> = signal([]);
  dockerfileContent: Signal<string | undefined> = signal<string>('');
  relatedSoftware: Signal<RelatedSoftware | null> = signal(null);

  selectedTab = signal<TabName>(TabName.README);

  /**
   * Available container platforms.
   * The selected option determines which tool the command examples will be adapted for.
   */
  containerPlatforms = [
    { name: 'Docker', value: 'docker', icon: 'assets/icons/logos/docker-mark-blue.svg' },
    { name: 'Podman', value: 'podman', icon: 'assets/icons/logos/podman.svg' },
  ];
  selectedContainerPlatform = signal<number>(
    (i => i === -1 ? 0 : i)(this.containerPlatforms.findIndex(
      p => p.value === localStorage.getItem('containerPlatform')
    ))
  );

  constructor() {
    this.isDarkTheme = this.themeService.isDarkTheme();

    // Persist selected container platform in local storage
    effect(() => {
      const index = this.selectedContainerPlatform();
      const value = this.containerPlatforms[index]?.value;
      localStorage.setItem('containerPlatform', value);
    });
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      const containerName = this.activatedRoute.snapshot.params['name'];
      this.containerService.getContainerInfo(containerName).subscribe({
        next: (container) => {
          this.container = container;
          this.status = Status.LOADED;
        },
        error: (error) => {
          if (error.status === 404) {
            this.status = Status.ERROR_NOT_FOUND;
          } else {
            this.status = Status.ERROR_SERVER;
          }
        },
      });
      runInInjectionContext(this.injector, () => {
        this.containerTags = this.containerService.getContainerTagsRes(containerName).value;
        this.ontologyCategories = this.containerService.getContainerCategoryHierarchy(containerName);
        this.dockerfileContent = this.dockerfileService.getContainerDockerfileContent(containerName).value;
        this.relatedSoftware = this.containerService.getRelatedSoftwareRes().value;
      });
    });
    this.viewportScroller.setOffset([0, 150]);
    this.activatedRoute.fragment.subscribe(fragment => {
      if (fragment && Object.values(TabName).includes(fragment as TabName)) {
        this.selectedTab.set(fragment as TabName);
      } else {
        this.selectedTab.set(TabName.README);
      }
    });
  }

  getLatestRecommendedTag(containerMetadata?: ImageMetadata | null): string {
    if (!containerMetadata || containerMetadata.recommended.length === 0) {
      return '';
    }

    const latestRecommended = containerMetadata.recommended.find(recommended => recommended.version === containerMetadata.latest);
    if (latestRecommended) {
      return latestRecommended.version;
    }
    // else
    return containerMetadata.recommended[containerMetadata.recommended.length - 1].version;
  }

  buildImageReference(container: DockerHubImage, tag?: string | null): string {
    let ref = `${container.namespace}/${container.name}`;
    if (tag) {
      ref += `:${tag}`;
    }
    return ref;
  }

  buildDockerPullCommand(container: DockerHubImage, tag?: string | null): string {
    return `docker pull ${this.buildImageReference(container, tag)}`;
  }

  convertPlainTextToLink(text: string): string {
    const urlPattern = /\((https?:\/\/[^\s]+)\)/g; // Captures URL inside parentheses
    return text.replace(urlPattern, (match, url) => {
      return `<a href="${url}" target="_blank">${match}</a>`;
    });
  }

  onTabSelectedGettingStarted(tab: string) {
    this.selectedTab.set(tab as TabName);
    history.pushState(null, "", window.location.pathname + '#' + tab);
  }

  getContainerMetadataByName(name: string): Signal<ImageMetadata | undefined> {
    return this.containerService.getContainerMetadataRes(name);
  }

  getVersionStatus(tag: DockerHubTag, containerMetadata: ImageMetadata): VersionStatus | undefined {
    if (containerMetadata.status === 'Unusable') {
      return VersionStatus.UNUSABLE;
    } else if (containerMetadata.status === 'Not_recommended') {
      return VersionStatus.NOT_RECOMMENDED;
    } else if (containerMetadata.recommended.find(recommended => recommended.version === tag.name)) {
      return VersionStatus.RECOMMENDED;
    } else if (tag.name === containerMetadata.latest) {
      return VersionStatus.LATEST;
    } else if (containerMetadata.bug_found.some(bug => {
      // Handle exact match
      if (bug.version === tag.name) return true;

      // Handle version ranges
      if (bug.version.includes('<') || bug.version.includes('>')) {
        return this.isVersionInRange(tag.name, bug.version);
      }

      return false;
    })) {
      return VersionStatus.BUG_FOUND;
    } else if (containerMetadata.not_working.includes(tag.name)) {
      return VersionStatus.NOT_WORKING;
    } else if (containerMetadata.no_longer_tested.includes(tag.name)) {
      return VersionStatus.NO_LONGER_TESTED;
    }
    return undefined;
  }

  private isVersionInRange(version: string, range: string): boolean {
    // Handle special case for "latest"
    if (version === 'latest') {
      // Typically "latest" is considered newer than any specific version
      // So "latest" would be > any version number
      const operator = range.substring(0, 2).includes('=') ? range.substring(0, 2) : range.substring(0, 1);
      return operator.includes('>'); // Only true for '>' or '>='
    }

    // Parse the version and range
    const cleanVersion = version.replace(/^v/, '');
    const operator = range.substring(0, 2).includes('=') ? range.substring(0, 2) : range.substring(0, 1);
    const rangeVersion = range.replace(operator, '').trim();

    // Handle versions with suffixes like "SNAPSHOT"
    const parsedVersion = cleanVersion.split('-')[0]; // Take only the version part before any suffix

    // Split versions into components
    const versionParts = parsedVersion.split('.').map(Number);
    const rangeParts = rangeVersion.split('.').map(Number);

    // Compare version components
    for (let i = 0; i < Math.max(versionParts.length, rangeParts.length); i++) {
      const vPart = versionParts[i] || 0;
      const rPart = rangeParts[i] || 0;

      if (vPart !== rPart) {
        const comparison = vPart > rPart ? 1 : -1;

        switch (operator) {
          case '<=': return comparison <= 0;
          case '>=': return comparison >= 0;
          case '<': return comparison < 0;
          case '>': return comparison > 0;
          default: return false;
        }
      }
    }

    // If we get here, the versions are equal in their numerical parts
    // For suffixed versions like "1.7.0-SNAPSHOT" compared to "1.7.0":
    if (cleanVersion.includes('-') && !rangeVersion.includes('-')) {
      // If the operator is <= or <, pre-release versions are considered lower
      // If the operator is >= or >, pre-release versions are considered higher
      return operator.includes('<');
    }

    // For exact equality
    return operator.includes('=');
  }

  removeReadmeOwnershipHeader(readme: string): string {
    return readme.replace(/# This image belongs to a larger project called Bioinformatics Docker Images Project.*/, '');
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

  /**
   * Get sorted related software by cooccurrence count and name
   */
  getSortedRelatedSoftware(): { name: string; displayName: string; count: number; inBdip: boolean }[] {
    const relatedSoftwareData = this.relatedSoftware();
    if (!relatedSoftwareData || !this.container) {
      return [];
    }

    const currentSoftware = this.container.name.toLowerCase();
    const currentEntry = relatedSoftwareData.software[currentSoftware];

    if (!currentEntry || !currentEntry.cooccurrences) {
      return [];
    }

    const allContainersMetadata = this.containerService.getAllContainersMetadataRes().value();
    const bdipContainers = new Set(allContainersMetadata ? Array.from(allContainersMetadata.keys()).map(k => k.toLowerCase()) : []);

    return Object.entries(currentEntry.cooccurrences)
      .map(([softwareName, cooccurrence]) => {
        const softwareEntry = relatedSoftwareData.software[softwareName];
        const displayName = softwareEntry?.names?.[0] || softwareName;
        const count = cooccurrence?.count ?? 0;
        const inBdip = bdipContainers.has(softwareName.toLowerCase());

        return {
          name: softwareName,
          displayName,
          count,
          inBdip
        };
      })
      .sort((a, b) => {
        // Sort by count desc
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        // Then by displayName asc (case-insensitive)
        return a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' });
      });
  }

  /**
   * Get articles where a specific software appears with the current container
   */
  getCooccurringArticles(softwareName: string): string[] {
    const relatedSoftwareData = this.relatedSoftware();
    if (!relatedSoftwareData || !this.container) {
      return [];
    }

    const currentSoftware = this.container.name.toLowerCase();
    const currentEntry = relatedSoftwareData.software[currentSoftware];

    if (!currentEntry || !currentEntry.cooccurrences) {
      return [];
    }

    const cooccurrence = currentEntry.cooccurrences[softwareName];

    if (!cooccurrence || !Array.isArray(cooccurrence.articles)) {
      return [];
    }

    return cooccurrence.articles;
  }

  /**
   * Generate Bio-Protocol article URL from article ID
   */
  getBioProtocolArticleUrl(articleId: string): string {
    return `https://doi.org/10.21769/BioProtoc.${articleId}`;
  }

  /* Markdown reactive files */
  /* ---------------------------------------------------------------------------------------------------------------- */
  getCliMarkdown(containerMetadata: ImageMetadata): string {
    const rawInvocation = `${containerMetadata.invocation_general} ${containerMetadata.test_invocation_specific}`;

    return `
# CLI

To test the image, you can use the test data available [here](${containerMetadata.test_data_url}). If there is a
README file, please follow the instructions that are given before proceeding because you may need to adjust some paths.

The results obtained should be similar to the ones [here](${containerMetadata.test_results_url }) provided.

Below you can find several ways of testing the image, according to your level of expertise.

## 1. Using \`docknrun\`

You can download the test data and run the Docker image using the [\`docknrun\` Docker image](http://bdip.i3s.up.pt/getting-started#run-commands).

## 2. Manual execution

You can create a working directory at the desired location, and within the working directory two additional directories
named \`test/data\` and \`test/results\`, download the test data using the link provided above, copy the file from the \`Downloads\`
folder to the \`test/data\` folder, unzip the file (if needed), and then open the command line (Linux) or Ubuntu app (Windows WSL),
and run the following command:

\`\`\`sh
${rawInvocation
  .replace('docker', this.containerPlatforms[this.selectedContainerPlatform()].value)
  .replace(this.buildImageReference(this.container!),
    this.buildImageReference(this.container!, containerMetadata?.recommended?.[0]?.version))}
\`\`\`

Where \`/your/data/dir\` points to the working directory where you have the test data.

## 3. Step by step execution

You can open a command line or Ubuntu app (Windows WSL) and invoke the following commands one by one (lines that start with # are
comments and therefore can be skipped as they have no effect). Note that \`/your/data/dir\` must be replaced by the path to the
desired working directory.

\`\`\`sh
# Attributes the value of the path to the working directory to the working_dir variable.
working_dir="/your/data/dir"
# Creates the test/data and test/results directories at the specified location (working dir). The -p option makes sures that any parent folders are created if needed.
mkdir -p $working_dir/test/data $working_dir/test/results
# Changes the directory to the test/data directory within the working directory.
cd $working_dir/test/data
# Downloads the test data to the test/data directory
wget "${containerMetadata.test_data_url}"
# to be executed only if the test data is zipped. It gets the name of the zipped file from the download link and unzips the file.
downloaded_file=$(basename "${containerMetadata.test_data_url}") && unzip "$downloaded_file"
# Moves the current directory one level up
cd ..
# Runs the Docker image using the test data
${rawInvocation
  .replace('/your/data/dir', '$(pwd)')
  .replace('docker', this.containerPlatforms[this.selectedContainerPlatform()].value)
  .replace(this.buildImageReference(this.container!),
    this.buildImageReference(this.container!, containerMetadata?.recommended?.[0]?.version))}
\`\`\`

## 4. Advanced execution

If you want to run a quick test, you can simply copy the following set of commands and paste all of them at once in the command
line or Ubuntu app (Windows WSL). The needed directory structure is created under \`/tmp\` with the name \`test.<random_word>\`:

\`\`\`sh
cd $(mktemp -d "/tmp/test.XXXXXXX")

mkdir test/data test/results

cd test/data
wget "${containerMetadata.test_data_url}"

downloaded_file = $(basename "${containerMetadata.test_data_url}")

if file "$downloaded_file" | grep -q "Zip archive data"; then
unzip "$downloaded_file"
fi

cd ..

${rawInvocation
  .replace('/your/data/dir', '$(pwd)')
  .replace('docker', this.containerPlatforms[this.selectedContainerPlatform()].value)
  .replace(this.buildImageReference(this.container!),
    this.buildImageReference(this.container!, containerMetadata?.recommended?.[0]?.version))}
\`\`\`
`;
  }

  getGuiMarkdown(containerMetadata: ImageMetadata): string {
    return `
# GUI

To test the image, you can use the test data available [here](${containerMetadata.test_data_url}). If there is a
README file, please follow the instructions that are given before proceeding because you may need to adjust some paths.

The results obtained should be similar to the ones [here](${containerMetadata.test_data_url}) provided.

You can run the following command to open the GUI (note that your current working directory will be available at \`/data\`):

\`\`\`sh
xhost + && ${this.containerPlatforms[this.selectedContainerPlatform()].value} run --rm -ti -e USERID=$UID -e USER=$USER -e DISPLAY=$DISPLAY -v /var/db:/var/db:Z -v /tmp/.X11-unix:/tmp/.X11-unix -v $HOME/.Xauthority:/home/developer/.Xauthority -v "$(pwd):/data" -v /var/run/docker.sock:/var/run/docker.sock -v /tmp:/tmp pegi3s/${containerMetadata.name}:${containerMetadata.latest} ${containerMetadata.gui_command}
\`\`\`
`;
  }
  /* ---------------------------------------------------------------------------------------------------------------- */

  protected readonly Status = Status;
  protected readonly VersionStatus = VersionStatus;
  protected readonly TabName = TabName;
}

enum Status {
  LOADING,
  LOADED,
  ERROR_NOT_FOUND,
  ERROR_SERVER,
}

enum VersionStatus {
  RECOMMENDED,
  LATEST,
  BUG_FOUND,
  NOT_WORKING,
  NO_LONGER_TESTED,
  // Hacky way to avoid writing more code
  NOT_RECOMMENDED,
  UNUSABLE
}

enum TabName {
  README = 'readme',
  TAGS = 'tags',
  TESTING = 'testing',
  DOCKERFILE = 'dockerfile',
  RELATED_SOFTWARE = 'related-software',
}
