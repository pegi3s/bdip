import { TitleCasePipe } from '@angular/common';
import {
  Component,
  input,
  output,
} from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';

let nextGroupId = 0;

@Component({
  selector: 'app-tabs',
  imports: [TitleCasePipe, SvgIconComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css',
})
export class TabsComponent {
  /* Input */
  readonly tabs = input.required<Tab[]>();
  /* Output */
  readonly activeTab = output<string>();

  /** Unique per-instance radio group name — two <app-tabs> on the same page must not share a
   *  native `name`, or the browser groups their radio inputs together and selecting a tab in
   *  one instance silently deselects the other. */
  protected readonly groupName = `app-tabs-${nextGroupId++}`;

  /**
   * Emits the ID of the selected tab.
   */
  protected onSelectTab(tab: Tab): void {
    this.activeTab.emit(tab.id);
  }
}

interface Tab {
  id: string;
  label?: string;
  icon?: string;
  active?: boolean;
}
