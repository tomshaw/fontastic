import { LessThanOrEqual, MoreThanOrEqual, MoreThan, LessThan } from "typeorm";
import { Collection } from "../entity"

export const CollectionRepository = {

  async fetchCollectionsWithCounts(args: any): Promise<Collection[]> {
    const db = this.createQueryBuilder("collection");

    db.where("collection.is_system = 0");

    db.leftJoinAndSelect("collection.stores", "store");
    // db.leftJoin("collection.stores", "store")
    
    db.loadRelationCountAndMap('store.storeCount', 'collection.stores'); // correct

    db.loadRelationCountAndMap('store.installableCount', 'collection.stores', "store", (qb: any) =>
      qb.andWhere("store.installable = :placeholder", {
        placeholder: true,
      }),
    );

    db.loadRelationCountAndMap('store.activatedCount', 'collection.stores', "store", (qb: any) =>
      qb.andWhere("store.activated = :placeholder", {
        placeholder: true,
      }),
    );

    db.loadRelationCountAndMap('store.temporaryCount', 'collection.stores', "store", (qb: any) =>
      qb.andWhere("store.temporary = :placeholder", {
        placeholder: true,
      }),
    );

    db.loadRelationCountAndMap('store.favoriteCount', 'collection.stores', "store", (qb: any) =>
      qb.andWhere("store.favorite = :placeholder", {
        placeholder: true,
      }),
    );

    db.orderBy(`LOWER(collection.title)`, 'ASC');

    return await db.getMany();
  },

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

  updateCollection(collectionId: number, data: any) {
    return this.createQueryBuilder().update(Collection)
      .set(data)
      .where("id = :id", { id: collectionId })
      .execute();
  },

  async updateCollectionIds(ids: any[], options: any) {
    return await this.createQueryBuilder()
    .update(Collection)
    .set(options)
    .where("collection.id IN (:...ids)", { ids })
    .execute();
  },

  async resetEnabled() {
    return this.createQueryBuilder().update(Collection)
      .set({ enabled: 0 })
      .execute();
  },

  async createCollection(args: any) {
    return (args?.parentId) ? await this.createChild(args.parentId, args.title) : await this.createParent(args.title);
  },

  fetchParents(row: Collection, target?: boolean, entities?: boolean) {
    let conditionA = (target) ? MoreThanOrEqual(row.right_id) : MoreThan(row.right_id);
    let conditionB = (target) ? LessThanOrEqual(row.left_id) : LessThan(row.left_id);
    let columns = (entities) ? ["collection.*"] : ["collection.id", "id"];
    return this.createQueryBuilder()
      .select(columns)
      .where({ right_id: conditionA, left_id: conditionB })
      .getRawMany();
  },

  fetchChildren(row: Collection, target?: boolean, entities?: boolean) {
    let conditionA = (target) ? LessThanOrEqual(row.right_id) : LessThan(row.right_id);
    let conditionB = (target) ? MoreThanOrEqual(row.left_id) : MoreThan(row.left_id);
    let columns = (entities) ? ["collection.*"] : ["collection.id", "id"];
    return this.createQueryBuilder()
      .select(columns)
      .where({ right_id: conditionA, left_id: conditionB })
      .getRawMany();
  },

  async createParent(title: string) {
    const data = await this.createQueryBuilder()
      .select("MAX(collection.right_id)", "right_id")
      .addSelect("MAX(collection.orderby)", "orderby")
      .getRawOne();

    return await this.createQueryBuilder().insert().into(Collection).values({
      title: title,
      parent_id: 0,
      left_id: data.right_id + 1,
      right_id: data.right_id + 2,
      orderby: data.orderby + 1
    }).execute();
  },

  async createChild(parentId: number, title: string) {
    const row = await this.findOne({ where: { id: parentId } });

    this.createQueryBuilder().update(Collection)
      .set({ left_id: () => "left_id + 2", right_id: () => "right_id + 2" })
      .where({ left_id: MoreThan(row.right_id) })
      .execute();

    this.createQueryBuilder().update(Collection)
      .set({ right_id: () => "right_id + 2" })
      .where({ left_id: LessThanOrEqual(row.left_id), right_id: MoreThanOrEqual(row.left_id) })
      .execute();

    return await this.createQueryBuilder().insert().into(Collection).values({
      title: title,
      parent_id: parentId,
      left_id: row.right_id,
      right_id: row.right_id + 1,
      orderby: row.orderby + 1
    }).execute();
  },

  async createSystemCollection() {
    const data = await this.createQueryBuilder()
      .select("MAX(collection.right_id)", "right_id")
      .addSelect("MAX(collection.orderby)", "orderby")
      .getRawOne();

    return await this.createQueryBuilder().insert().into(Collection).values({
      title: 'System Fonts',
      parent_id: 0,
      is_system: 1,
      left_id: data.right_id + 1,
      right_id: data.right_id + 2,
      orderby: data.orderby + 1
    }).execute();
  }
}