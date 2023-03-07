import { Injectable } from '@angular/core';
import { Md5 } from 'ts-md5';

@Injectable({
  providedIn: 'root'
})
export class GravatarService {

  public gravatarSize = 16;
  public gravatarFallback = 'mm';

  constructor() { }

  url(email: string, size: number = this.gravatarSize, fallback: string = this.gravatarFallback): string {
    const emailHash = Md5.hashStr(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${emailHash}?s=${size}&d=${fallback}`;
  }
}
