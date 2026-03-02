export class LatestNewsModel {
  constructor(
    public ts: number = 0,
    public artiles: any[] = [],
    public apiKey: string = '',
  ) { }
}
