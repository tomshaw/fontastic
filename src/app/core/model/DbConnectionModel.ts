export class DbConnectionModel {

  constructor(
    public name: string = '',
    public title: string = '',
    public description: string = '',
    public type: string = '',
    public database: string,
    public username: string = '',
    public password: string = '',
    public host: string = '',
    public port: string = '',
    public logging: boolean = false,
    public synchronize: boolean = false
  ) { }
}
