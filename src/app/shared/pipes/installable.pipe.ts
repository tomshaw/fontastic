import { Pipe, PipeTransform } from '@angular/core';
import { installable } from '@main/config/mimes';

@Pipe({ name: 'installable' })
export class InstallablePipe implements PipeTransform {
  constructor() { }
  transform(value: any) {
    return (installable.includes(value)) ? true : false;
  }
}
