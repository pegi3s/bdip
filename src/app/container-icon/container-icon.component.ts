import { SlicePipe, UpperCasePipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-container-icon',
  standalone: true,
  imports: [SlicePipe, UpperCasePipe],
  templateUrl: './container-icon.component.html',
  styleUrl: './container-icon.component.css'
})
export class ContainerIconComponent {
  icon = input<string>();
  name = input<string>('');
  color = input<string>('#0082c4');
}
