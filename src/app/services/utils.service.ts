import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  constructor() { }

  getOS(): string {
    /* const platform = navigator.userAgentData.platform; */
    const platform = navigator.platform;
    if (platform.indexOf('Win') !== -1) {
      return 'windows';
    } else if (platform.indexOf('Linux') !== -1) {
      return 'linux';
    }
    return '';
  }
}
