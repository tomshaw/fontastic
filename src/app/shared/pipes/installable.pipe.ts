import { Pipe, PipeTransform } from '@angular/core';
import { installable } from '@main/config/mimes';

@Pipe({ standalone: false, name: 'installable' })
export class InstallablePipe implements PipeTransform {
  constructor() { }
  transform(value: any) {
    return (installable.includes(value)) ? true : false;
  }
}