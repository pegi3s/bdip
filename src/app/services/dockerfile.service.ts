import { Injectable, Resource, Signal } from "@angular/core";
import { githubInfo } from "../core/constants/github-info";
import { httpResource } from "@angular/common/http";
import { GitTree, GitTreeItem } from "../models/git-tree";
import { ImageMetadata } from "../models/image-metadata";

@Injectable({
  providedIn: 'root',
})
export class DockerfileService {
  private readonly repositoryTreeURL = `https://api.github.com/repos/${githubInfo.owner}/${githubInfo.repository}/git/trees/${githubInfo.branch}?recursive=1`;

  private readonly repositoryTree = httpResource<GitTree>(
    () => this.repositoryTreeURL
  );

  private getContainerDockerfilePath(containerName: string, metadata?: ImageMetadata): GitTreeItem | undefined {
    const tree = this.repositoryTree.value()?.tree;
    if (!tree) {
      return undefined;
    }

    const lowerContainerName = containerName.toLowerCase();

    // First, check if there's a Dockerfile directly at <tool_name>/Dockerfile
    const directDockerfile = tree.find(file =>
      file.path.toLowerCase() === `${lowerContainerName}/dockerfile`
    );

    if (directDockerfile) {
      return directDockerfile;
    }

    // If metadata exists and has the `latest` field, try to find the Dockerfile for that version
    if (metadata?.latest) {
      const versionedPath = `${lowerContainerName}/${metadata.latest}/dockerfile`;
      const versionedDockerfile = tree.find(file =>
        file.path.toLowerCase() === versionedPath
      );

      if (versionedDockerfile) {
        return versionedDockerfile;
      }
    }

    // Fallback: Find all versioned Dockerfiles and return the last one alphabetically
    const matches = tree.filter(file => {
      const path = file.path.toLowerCase();
      return path.startsWith(`${lowerContainerName}/`) && path.endsWith('/dockerfile');
    });

    return matches?.[matches.length - 1];
  }

  getContainerDockerfileContent(containerName: Signal<string>, metadata?: Signal<ImageMetadata | undefined>): Resource<string | undefined> {
    return httpResource.text(() => {
      const path = this.getContainerDockerfilePath(containerName(), metadata?.())?.path;
      if (!path) {
        return undefined;
      } else {
        return `https://raw.githubusercontent.com/${githubInfo.owner}/${githubInfo.repository}/refs/heads/${githubInfo.branch}/${path}`;
      }
    }).asReadonly();
  }

  getDockerfileFromUrl(url: Signal<string>): Resource<string | undefined> {
    return httpResource.text(() => url()).asReadonly();
  }
}
