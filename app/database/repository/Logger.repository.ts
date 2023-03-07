import { Logger } from "../entity";

export const LoggerRepository = {
  async saveData(data: Logger): Promise<any> {
    return await this.createQueryBuilder()
      .insert()
      .into(Logger)
      .values(data)
      .execute();
  }
}