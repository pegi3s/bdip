import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-reason-card',
  standalone: true,
  imports: [],
  templateUrl: './reason-card.component.html',
  styleUrl: './reason-card.component.css'
})
export class ReasonCardComponent {
  @Input() icon = '';
  @Input() title = '';
  @Input() description = '';
}
