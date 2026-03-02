import { LessThanOrEqual, MoreThanOrEqual, MoreThan, LessThan } from "typeorm";
import { Collection } from "../entity"

export const CollectionRepository = {

  async deleteCollection(collectionId: number) {

    const row = await this.findOne({ where: { id: collectionId } });

    // Item cannot be found.
    if (!row) return;

    const children = await this.fetchChildren(row, false, true);
    // const parents = await this.fetchParents(row);

    // Item has children cannot be deleted.
    if (children.length) return;

    // Delete row.
    await this.createQueryBuilder().delete().where("id = :id", { id: collectionId }).execute();

    // Shift right node.
    await this.createQueryBuilder().update(Collection)
      .set({ right_id: () => "right_id - 2" })
      .where({ left_id: LessThan(row.right_id), right_id: MoreThan(row.right_id) })
      .execute();

    // Shift left + right nodes.
    await this.createQueryBuilder().update(Collection)
      .set({ left_id: () => "left_id - 2", right_id: () => "right_id - 2" })
      .where({ left_id: MoreThan(row.right_id) })
      .execute();

    return children;
  },

  async updateCollectionCount(collectionId: number, total: number) {
    return this.createQueryBuilder().update(Collection)
      .set({ count: total })
      .where("id = :id", { id: collectionId })
      .execute();
  },

  async updateCollectionCounts(items: any[]) {
    return items.forEach(async item => {
      return await this.createQueryBuilder()
        .update(Collection)
        .set({ count: item.total })
        .where("id = :id", { id: item.collection_id })
        .execute();
    });
  },

  updateCollection(options: any) {
    return this.createQueryBuilder().update(Collection)
      .set(options)
      .where("id = :id", { id: options.id })
      .execute();
  },

  async resetEnabled() {
    return this.createQueryBuilder().update(Collection)
      .set({ enabled: 0 })
      .execute();
  },

  async createCollection(parentId: number | any) {
    return (parentId) ? await this.createChild(parentId) : await this.createParent();
  },

  fetchParents(range: any, target?: boolean, entities?: boolean) {
    let conditionA = (target) ? MoreThanOrEqual(range.right_id) : MoreThan(range.right_id);
    let conditionB = (target) ? LessThanOrEqual(range.left_id) : LessThan(range.left_id);
    let columns = (entities) ? ["collection.*"] : ["collection.id", "id"];
    return this.createQueryBuilder()
      .select(columns)
      .where({ right_id: conditionA, left_id: conditionB })
      .getRawMany();
  },

  fetchChildren(range: any, target?: boolean, entities?: boolean) {
    let conditionA = (target) ? LessThanOrEqual(range.right_id) : LessThan(range.right_id);
    let conditionB = (target) ? MoreThanOrEqual(range.left_id) : MoreThan(range.left_id);
    let columns = (entities) ? ["collection.*"] : ["collection.id", "id"];
    return this.createQueryBuilder()
      .select(columns)
      .where({ right_id: conditionA, left_id: conditionB })
      .getRawMany();
  },

  async createParent() {
    const data = await this.createQueryBuilder()
      .select("MAX(collection.right_id)", "right_id")
      .addSelect("MAX(collection.orderby)", "orderby")
      .getRawOne();

    return await this.createQueryBuilder().insert().into(Collection).values({
      title: 'New Collection',
      parent_id: 0,
      left_id: data.right_id + 1,
      right_id: data.right_id + 2,
      orderby: data.orderby + 1
    }).execute();
  },

  async createChild(id: number) {
    //const row = await this.findOne({ id: id });
    const row = await this.findOne({ where: { id: id } });

    this.createQueryBuilder().update(Collection)
      .set({ left_id: () => "left_id + 2", right_id: () => "right_id + 2" })
      .where({ left_id: MoreThan(row.right_id) })
      .execute();

    this.createQueryBuilder().update(Collection)
      .set({ right_id: () => "right_id + 2" })
      .where({ left_id: LessThanOrEqual(row.left_id), right_id: MoreThanOrEqual(row.left_id) })
      .execute();

    return await this.createQueryBuilder().insert().into(Collection).values({
      title: 'New Collection',
      parent_id: id,
      left_id: row.right_id,
      right_id: row.right_id + 1,
      orderby: row.orderby + 1
    }).execute();

  }
}