import { TermStanza } from "../obo/TermStanza";

export type Article = {
  short_name: string;
  url: string;
  mentions: string[];
};

export type Recommendation = {
  section_header: string[];
  categories: TermStanza[];
  also_relevant: string[];
  articles: Article[];
};
