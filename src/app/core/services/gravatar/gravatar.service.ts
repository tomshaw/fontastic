import { Injectable } from '@angular/core';

import { Md5 } from './md5';

@Injectable({
  providedIn: 'root'
})
export class GravatarService {

  public DefaultGravatarSize:number = 16;
  public DefaultGravatarFallback:string = 'mm';

  constructor() { }

  public url(email: string, size: number = this.DefaultGravatarSize, fallback: string = this.DefaultGravatarFallback): string {
    const emailHash = Md5.hashStr(email.toLowerCase());
    return `https://www.gravatar.com/avatar/${emailHash}?s=${size}&d=${fallback}`;
  }
}
