import { Injectable, Resource, Signal } from "@angular/core";
import { githubInfo } from "../core/constants/github-info";
import { httpResource } from "@angular/common/http";
import { GitTree, GitTreeItem } from "../models/git-tree";

@Injectable({
  providedIn: 'root',
})
export class DockerfileService {
  private readonly repositoryTreeURL = `https://api.github.com/repos/${githubInfo.owner}/${githubInfo.repository}/git/trees/${githubInfo.branch}?recursive=1`;

  private readonly repositoryTree = httpResource<GitTree>(
    () => this.repositoryTreeURL
  );

  private getContainerDockerfilePath(containerName: string): GitTreeItem | undefined {
    const matches = this.repositoryTree.value()?.tree.filter(file => {
      const path = file.path.toLowerCase();
      return path.startsWith(`${containerName.toLowerCase()}/`) && path.endsWith('/dockerfile');
    });

    return matches?.[matches.length - 1];
  }

  getContainerDockerfileContent(containerName: Signal<string>): Resource<string | undefined> {
    return httpResource.text(() => {
      const path = this.getContainerDockerfilePath(containerName())?.path;
      return `https://raw.githubusercontent.com/${githubInfo.owner}/${githubInfo.repository}/refs/heads/${githubInfo.branch}/${path}`;
    }).asReadonly();
  }

  getDockerfileFromUrl(url: Signal<string>): Resource<string | undefined> {
    return httpResource.text(() => url()).asReadonly();
  }
}
