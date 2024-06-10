import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContributorCardComponent } from './contributor-card.component';
import { Contributor } from '../../models/contributor.model';
import * as Organization from '../../../../models/organization';

describe('ContributorCardComponent', () => {
  let component: ContributorCardComponent;
  let fixture: ComponentFixture<ContributorCardComponent>;

  const contributor: Contributor = {
    name: 'John Doe',
    description: 'A contributor',
    photo: 'photo.jpg',
    contactInfo: {
      email: 'johndoe@testemail.com',
      orcid: '0000-0000-0000-0000',
    },
    organizations: [Organization.SING],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContributorCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContributorCardComponent);
    fixture.componentRef.setInput('contributor', contributor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
