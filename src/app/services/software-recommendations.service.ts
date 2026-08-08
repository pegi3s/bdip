import { computed, inject, Service } from "@angular/core";
import { githubInfo } from "../core/constants/github-info";
import { httpResource } from "@angular/common/http";
import { Article, Recommendation } from "../models/software-recommendation";
import { ContainerService } from "./container.service";
import { TermStanza } from "../obo/TermStanza";

@Service()
export class SoftwareRecommendationsService {
  private readonly baseMetadataURL = `https://raw.githubusercontent.com/${githubInfo.owner}/${githubInfo.repository}/${githubInfo.branch}/metadata/`;
  private readonly urlSoftwareRecommendations = `${this.baseMetadataURL}/software_recommendations.json`;

  private readonly containerService = inject(ContainerService);

  private readonly softwareRecommendationsRaw = httpResource(
    () => this.urlSoftwareRecommendations,
    { defaultValue: [] }
  );

  readonly softwareRecommendations = computed<Recommendation[]>(
    () => this.parser(this.softwareRecommendationsRaw.value())
  );

  private parser(response: unknown): Recommendation[] {
    const rawRecommendations = response as {
      section_header: string[];
      categories: string[];
      also_relevant: string[];
      articles: Article[];
    }[];

    const ontology = this.containerService.getOntologyRes();

    if (!ontology.hasValue()) {
      return [];
    }

    return rawRecommendations.map(rawRec => {
      const categories = rawRec.categories
        .map(categoryId => {
          const term = ontology.value()!.findTermById(categoryId);
          if (!term) {
            console.warn(`Term with ID ${categoryId} not found in ontology.`);
          }
          return term;
        })
        .filter((term): term is TermStanza => term !== null);

      return {
        section_header: rawRec.section_header,
        categories: categories,
        also_relevant: rawRec.also_relevant,
        articles: rawRec.articles
      };
    });
  }
}
