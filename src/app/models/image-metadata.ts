export type ImageMetadata = {
  name: string;
  description: string;
  status: string;
  recommended: string;
  latest: string;
  useful: string[];
  bug_found: string[];
  not_working: string[];
  recommended_last_tested: string;
  no_longer_tested: string[];
  pegi3s_url: string;
  manual_url: string;
  github_url: string;
  comments: string[];
  gui: boolean;
  podman: string;
  singularity: string;
  invocation_general: string;
  invocation_general_comments: string[];
  usual_invocation_specific: string;
  usual_invocation_specific_comments: string[];
  test_invocation_specific: string;
  test_data_url: string;
  test_results_url: string;
  icon: string;
};