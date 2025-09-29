export type GitTreeItem = {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size?: number;
  url?: string;
}

export type GitTree = {
  sha: string;
  url?: string;
  truncated: boolean;
  tree: GitTreeItem[];
}
