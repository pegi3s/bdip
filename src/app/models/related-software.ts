export type RelatedSoftware = {
  metadata: {
    generated_at: string;
    source_files: {
      extraction: string;
      cooccurrences: string;
    };
    cooccurrence_metadata: {
      generated_at: string;
      source_file: string;
      total_software: number;
      min_cooccurrence_threshold: number;
    };
  };
  articles: Article[];
  software: Record<string, SoftwareEntry>;
}

export type Article = {
  article_number: string;
  title: string | null;
  abstract: string | null;
  software: ArticleSoftware[];
}

export type ArticleSoftware = {
  name: string;
  version: string | null;
  url: string | null;
}

export type SoftwareEntry = {
  names: string[];
  versions: string[];
  urls: string[];
  statistics: SoftwareStatistics;
  articles: string[];
  cooccurrences: Record<string, SoftwareCooccurrence>;
}

export type SoftwareStatistics = {
  total_mentions: number;
  total_papers: number;
  cooccurrence_count: number;
}

export type SoftwareCooccurrence = {
  count: number;
  articles: string[];
}
