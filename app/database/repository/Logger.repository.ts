import { Logger } from "../entity";

export const LoggerRepository = {
  log(data: any) {
    return this.createQueryBuilder().insert().into(Logger).values(data).execute();
  }
}