import { ContactType } from './contact-type';
import { Organization } from './organization';

export interface Contributor {
  name: string;
  description: string;
  photo: string;
  contactInfo: { type: ContactType; value: string }[];
  organizations: Organization[];
}
