import { Organization } from './organization';

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
}
