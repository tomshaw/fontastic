import { Directive, ElementRef, Input, OnChanges, OnInit } from '@angular/core';
import { GravatarService } from '@app/core/services';

@Directive({
  selector: '[gravatar]'
})
export class GravatarDirective implements OnInit, OnChanges {

  @Input() email: string;
  @Input() size: number;
  @Input() fallback: string;

  constructor(
    public elementRef: ElementRef,
    public gravatarService: GravatarService
  ) { }

  ngOnInit() {
    this.setSrcUrl();
  }

  ngOnChanges() {
    this.setSrcUrl();
  }

  setSrcUrl() {
    this.elementRef.nativeElement.src = this.gravatarService.url(this.email, this.size, this.fallback);
  }
}
