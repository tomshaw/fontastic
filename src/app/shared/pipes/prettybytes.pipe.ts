import { Pipe, PipeTransform } from '@angular/core';
import prettyBytes from 'pretty-bytes';

@Pipe({ standalone: false, name: 'prettyBytes' })
export class PrettyBytesPipe implements PipeTransform {
  constructor() { }
  transform(value: any) {
    return prettyBytes(value);
  }
}