
export class SearchFormModel {
  constructor(
    public term: string = '',
    public mimes: any[] = [],
    public sort: string = 'id',
    public order: string = 'ASC',
    public activated: boolean = false
  ) { }
}
