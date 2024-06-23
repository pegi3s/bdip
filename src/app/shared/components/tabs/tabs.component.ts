import { TitleCasePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css'
})
export class TabsComponent {
  /* Input */
  tabs = input.required<Tab[]>();
  /* Output */
  activeTab = output<string>();

  /**
   * Emits the ID of the selected tab.
   */
  onSelectTab(tab: Tab) {
    this.activeTab.emit(tab.id);
  }
}

interface Tab {
  id: string;
  label?: string;
  icon?: string;
  active?: boolean;
}
