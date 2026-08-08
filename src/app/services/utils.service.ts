import { Service } from '@angular/core';

@Service()
export class UtilsService {
  /** Determines the operating system of the user's device. */
  getOS(): string {
    /* const platform = navigator.userAgentData.platform; */
    const platform = navigator.platform;
    if (platform.includes('Win')) {
      return 'windows';
    } else if (platform.includes('Linux')) {
      return 'linux';
    }
    return '';
  }
}
