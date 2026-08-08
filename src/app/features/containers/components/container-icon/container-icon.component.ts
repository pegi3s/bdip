import { SlicePipe, UpperCasePipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-container-icon',
  imports: [SlicePipe, UpperCasePipe],
  templateUrl: './container-icon.component.html',
  styleUrl: './container-icon.component.css',
})
export class ContainerIconComponent {
  /* Inputs */
  readonly icon = input<string>();
  readonly name = input<string>('');
  readonly color = input<string>('#0082c4');
}
