import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '@app/core/services';
import { QueryOptions } from '@main/types';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss']
})
export class PaginatorComponent implements OnInit {

  resultSetCount = 0;
  resultSetTotal = 0;

  page = 1;
  pages = 1;
  limit = 100;
  offset = 0;

  deactivatePrev = false;
  deactivateNext = false;

  limitOptions: any[] = [
    { value: 100, title: '100' },
    { value: 150, title: '150' },
    { value: 200, title: '200' },
    { value: 250, title: '250' },
    { value: 300, title: '300' }
  ];

  constructor(
    private databaseService: DatabaseService
  ) { }

  ngOnInit(): void {
    this.databaseService.watchActivePage$.subscribe((result) => this.page = result);

    this.databaseService.watchResultSetCount$.subscribe((result) => this.resultSetCount = result);
    
    this.databaseService.watchResultSetTotal$.subscribe((result) => {
      this.resultSetTotal = result;
      const pages = Math.ceil(this.resultSetTotal / this.limit);
      this.pages = (pages) ? pages : 1; 
      this.checkButtonStatus();
    });
  }

  getQueryOptions(): QueryOptions {
    return this.databaseService.getQueryOptions();
  }

  handlePageInput(event: any): void {
    const el = event.srcElement;
    const target = event.target;
    const page = target.value;

    if (page < 1) {
      this.page = 1;
    } else if (page > this.pages) {
      this.page = this.pages;
    } else {
      this.page = page;
    }

    this.calculateOffset();

    this.checkButtonStatus();

    this.paginate();

    if (event.keyCode === 13) {
      el.blur();
    }
  }

  onButtonClick(direction: string) {
    if (direction === 'next') {
      this.page++;
    } else {
      this.page--;
    }

    this.calculateOffset();
    this.checkButtonStatus();
    this.paginate();
  }

  onSelectChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.limit = Number(target.value);
    this.databaseService.resetPage(1);
    this.calculateOffset();
    this.checkButtonStatus();
    this.paginate();
  }

  paginate(): void {
    const options: QueryOptions = {
      ...this.getQueryOptions(),
      skip: this.offset,
      take: this.limit
    };

    this.databaseService.execute(options);
  }

  checkButtonStatus(): void {
    if (this.resultSetTotal > this.limit) {
      if (this.page === 1) {
        this.setButtonStatus(true, false);
      } else if (this.page > 1 && this.page < this.pages) {
        this.setButtonStatus(false, false);
      } else {
        this.setButtonStatus(false, true);
      }
    } else {
      this.setButtonStatus(true, true);
    }
  }

  setButtonStatus(prev: boolean, next: boolean): void {
    this.deactivatePrev = prev;
    this.deactivateNext = next;
  }

  calculateOffset(): void {
    if (this.page === 1) {
      this.offset = 0;
    } else {
      this.offset = (this.page - 1) * this.limit;
    }
  }
}
