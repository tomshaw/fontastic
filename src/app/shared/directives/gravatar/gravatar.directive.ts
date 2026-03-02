import { Directive, ElementRef, Input } from '@angular/core';

import { GravatarService } from '@app/core/services';

@Directive({
  standalone: false,
  selector: '[gravatar]'
})
export class GravatarDirective {

  constructor(
    public elementRef: ElementRef, 
    public _gravatar: GravatarService
  ) {}

  @Input('email') email!: string;
  @Input('size') size!: number;
  @Input('fallback') fallback!: string;

  ngOnInit() {
    this.setSrcUrl();
  }

  ngOnChanges() {
    this.setSrcUrl();
  }

  setSrcUrl() {
    this.elementRef.nativeElement.src = this._gravatar.url(this.email, this.size, this.fallback);
  }
}
