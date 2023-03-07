import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DatabaseService, MessageService, ModalService } from '@app/core/services';
import { Collection } from '@main/database/entity';

export class CollectionModel {
  constructor(
    public title: string = '',
    public parentId?: number
  ) { }
}

export interface CollectionOptions {
  parentId: number;
  name: string;
}

@Component({
  selector: 'app-create-collection',
  templateUrl: './create-collection.component.html',
  styleUrls: ['./create-collection.component.scss']
})
export class CreateCollectionComponent implements OnInit {

  result: CollectionModel = new CollectionModel('', 0);
  options: CollectionOptions[] = [];

  constructor(
    public modalService: ModalService,
    private messageService: MessageService,
    private databaseService: DatabaseService,
  ) { }

  ngOnInit(): void {
    this.databaseService.watchCollectionResultSet$.subscribe((results: Collection[]) => {
      if (results) {
        const options = [{ parentId: 0, name: 'Root Collection' }];
        results.forEach((result: Collection) => {
          if (result?.stores?.length) {
            return;
          }
          options.push({
            parentId: result.id,
            name: result.title
          });
        });

        this.options = options;
      }
    });
  }

  onSubmit(form: NgForm): void {
    if (!form.valid) {
      return;
    }

    const values: CollectionOptions = form.value;

    this.messageService.collectionCreate(values).then((results: Collection[]) => this.databaseService.setCollectionResultSet(results));

    this.result = new CollectionModel('', 0);
    this.options = [];

    this.modalService.close();
  }

}
