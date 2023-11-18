import { Component, OnInit } from '@angular/core';
import { DatabaseService, PresentationService } from '@app/core/services';
import { Store } from '@main/database/entity';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss']
})
export class StoreComponent implements OnInit {

  openTabs = ['store'];

  results = [];
  resultsTemplate = ['file_name', 'full_name', 'file_path', 'file_type', 'file_size', 'file_size_pretty', 'id', 'collection_id', 'activated', 'installable', 'favorite', 'system', 'temporary', 'created', 'updated'];

  uppercase = ['file_type'];
  optionable = ['activated', 'installable', 'favorite', 'system', 'temporary'];

  constructor(
    private databaseService: DatabaseService,
    private presentationService: PresentationService
  ) { }

  ngOnInit() {
    this.databaseService.watchStoreResult$.subscribe((result: Store) => {
      if (result?.id) {
        const results = [];
        this.resultsTemplate.forEach((key: string) => {
          if (Object.prototype.hasOwnProperty.call(result, key)) {
            const name = key.replace(/_/g, ' ');
            const value = (this.uppercase.includes(key)) ? result[key].toUpperCase() : result[key];
            if (this.optionable.includes(key)) {
              results.push({ key, name, value: (value) ? 'Yes' : 'No' });
            } else {
              results.push({ key, name, value });
            }
          }
        });
        
        this.results = results;
      }
    });
  }

  handleToggleCollapse(name: string): void {
    if (this.openTabs.includes(name)) {
      this.openTabs.splice(this.openTabs.indexOf(name), 1);
    } else {
      this.openTabs.push(name);
    }
    //this.presentationService.setAsideTableTabs(this.openTabs);
  }

  onComponentSwitch() {
    this.presentationService.setAsideComponent('tables');
  }
}
