import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DatabaseService, MessageService, ModalService } from '@app/core/services';
import { Collection } from '@main/database/entity';

export class CollectionModel {
  constructor(
    public id: number,
    public title: string
  ) { }
}

@Component({
  selector: 'app-update-collection',
  templateUrl: './update-collection.component.html',
  styleUrls: ['./update-collection.component.scss']
})
export class UpdateCollectionComponent implements OnInit {

  result: CollectionModel = new CollectionModel(0, '');
  hasChildren = true;

  constructor(
    public modalService: ModalService,
    private messageService: MessageService,
    private databaseService: DatabaseService,
  ) { }

  ngOnInit(): void {
    this.databaseService.watchCollectionResultSet$.subscribe((results: Collection[]) => {
      if (results) {
        const collectionId = this.databaseService.getCollectionId();
        if (collectionId) {
          const result = results.find((item: Collection) => item.id === collectionId);
          if (result) {
            this.result = new CollectionModel(result.id, result.title);
          }
          this.findChildren(collectionId, results);
        }
      }
    });
  }

  findChildren(collectionId: number, results: Collection[]) {
    const found = results.filter((item: Collection) => item.parent_id === collectionId);
    this.hasChildren = (found && found.length) ? true : false;
  }

  handleDelete(event: Event, collectionId: number): void {
    event.stopPropagation();
    this.messageService.collectionDelete(collectionId).then((result: Collection[]) => {
      this.databaseService.setCollectionResultSet(result);
      this.messageService.log(`Deleted collection id #${collectionId}.`, 1);
      this.modalService.close();
    });
  }

  onSubmit(form: NgForm): void {
    if (!form.valid) {
      return;
    }

    const values = form.value;
    this.messageService.collectionUpdate(values.id, values).then((results: Collection[]) => this.databaseService.setCollectionResultSet(results));

    this.result = new CollectionModel(0, '');

    this.modalService.close();
  }

}
