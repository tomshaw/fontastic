import { Component, Input, OnInit } from '@angular/core';
import { PresentationService } from '@app/core/services';

@Component({
  selector: 'app-pairing',
  templateUrl: './pairing.component.html',
  styleUrls: ['./pairing.component.scss']
})
export class PairingComponent implements OnInit {

  @Input() fontObject: opentype.Font;
  @Input() fontFamily: string;
  @Input() latestNews: any[] = [];

  fontColor: string;

  constructor(
    private presentationService: PresentationService
  ) { }

  ngOnInit(): void {
    const root = document.documentElement as HTMLElement;
    this.fontColor = root.style.getPropertyValue('--fill-color');
  }

  onComponentSwitch() {
    this.presentationService.setInspectComponent('glyph-list');
  }
}
