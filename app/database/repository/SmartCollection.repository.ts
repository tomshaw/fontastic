import { SmartCollection } from '../entity';

export const SmartCollectionRepository = {
  async fetchAll(): Promise<SmartCollection[]> {
    return this.createQueryBuilder('sc').orderBy('sc.orderby', 'ASC').addOrderBy('LOWER(sc.title)', 'ASC').getMany();
  },

  async createSmartCollection(args: { title: string; rules: string; match_type: string }) {
    await this.createQueryBuilder()
      .insert()
      .into(SmartCollection)
      .values({
        title: args.title,
        rules: args.rules,
        match_type: args.match_type,
      })
      .execute();
    return this.fetchAll();
  },

  async updateSmartCollection(id: number, data: Partial<SmartCollection>) {
    await this.createQueryBuilder().update(SmartCollection).set(data).where('id = :id', { id }).execute();
    return this.fetchAll();
  },

  async deleteSmartCollection(id: number) {
    await this.createQueryBuilder().delete().from(SmartCollection).where('id = :id', { id }).execute();
    return this.fetchAll();
  },
};
