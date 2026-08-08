import {
  Component,
  input,
  model,
  signal,
} from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  selector: 'app-stepper',
  imports: [SvgIconComponent],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.css',
})
export class StepperComponent {
  /* Input */
  readonly steps = input.required<Step[]>();
  readonly currentStep = model.required<number>();
  protected readonly previousStep = signal(-1); // Used to avoid animations when skipping steps

  protected setStep(stepNumber: number): void {
    this.previousStep.set(this.currentStep());
    this.currentStep.set(stepNumber);
  }

  protected isAdjacent(stepNumber: number): boolean {
    return Math.abs(stepNumber - this.previousStep()) === 1;
  }
}

export interface Step {
  name: string;
  icon?: string;
}
