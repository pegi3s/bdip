import { Organization } from '../../../models/organization';

export interface ContributorPeriod {
  from: string;
  to?: string;
}

export interface Contributor {
  name: string;
  description: string;
  photo: string;
  contactInfo: {
    email?: string;
    orcid?: string;
    github?: string;
  };
  organizations: Organization[];
  period?: ContributorPeriod;
}
