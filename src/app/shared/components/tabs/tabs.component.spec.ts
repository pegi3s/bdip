import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { TabsComponent } from './tabs.component';

describe('TabsComponent', () => {
  let component: TabsComponent;
  let fixture: ComponentFixture<TabsComponent>;

  const tabs = [{ label: 'Tab 1', active: true }, { label: 'Tab 2' }];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsComponent],
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TabsComponent);
    fixture.componentRef.setInput('tabs', tabs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the tabs', () => {
    const tabsRendered = fixture.debugElement.queryAll(By.css('.tab'));
    expect(tabsRendered.length).toBe(tabs.length);
  });

  it('should display the active tab', () => {
    const activeTab = fixture.debugElement.query(By.css('input:checked'));
    expect(activeTab.nativeElement.id).toContain(tabs[0].label);
  });

  it('should emit the selected tab on onSelectTab', () => {
    spyOn(component.activeTab, 'emit');
    const expectedTab = 'Test Tab';
    component.onSelectTab(expectedTab);
    expect(component.activeTab.emit).toHaveBeenCalledWith(expectedTab);
  });
});
