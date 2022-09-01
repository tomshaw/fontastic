import { Pipe, PipeTransform } from '@angular/core';
import prettyBytes from 'pretty-bytes';

@Pipe({ name: 'prettyBytes' })
export class PrettyBytesPipe implements PipeTransform {
  constructor() { }
  transform(value: any) {
    return prettyBytes(value);
  }
}
