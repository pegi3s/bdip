import { TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, Output, input } from '@angular/core';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css'
})
export class TabsComponent {
  tabs = input.required<Tab[]>();
  @Output() activeTab = new EventEmitter<string>();

  onSelectTab(tab: string) {
    this.activeTab.emit(tab);
  }
}

interface Tab {
  label: string;
  icon?: string;
  active?: boolean;
}
