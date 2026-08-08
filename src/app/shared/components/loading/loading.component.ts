import { Component } from '@angular/core';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css',
})
export class LoadingComponent {
  /** Purely decorative blocks in the loader's 4x4 grid — see .loader span in the stylesheet
   *  for how index maps to grid position and animation delay. */
  protected readonly blocks = Array.from({ length: 16 }, (_, i) => i);
}
