import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceExampleDir'
})
export class ReplaceExampleDirPipe implements PipeTransform {

  transform(value: string): string {
    return value.replace(/\/your\/data\/dir/g, '$(pwd)');
  }

}
