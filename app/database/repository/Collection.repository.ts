import { LessThanOrEqual, MoreThanOrEqual, MoreThan, LessThan } from 'typeorm';
import { Collection } from '../entity';

export const CollectionRepository = {
  async fetchCollectionsWithCounts(args: any): Promise<Collection[]> {
    const db = this.createQueryBuilder('collection');

    db.where('collection.is_system = 0');

    db.leftJoin('collection.stores', 'store');

    db.loadRelationCountAndMap('store.storeCount', 'collection.stores'); // correct

    db.loadRelationCountAndMap('store.installableCount', 'collection.stores', 'store', (qb: any) =>
      qb.andWhere('store.installable = :placeholder', {
        placeholder: true,
      }),
    );

    db.loadRelationCountAndMap('store.temporaryCount', 'collection.stores', 'store', (qb: any) =>
      qb.andWhere('store.temporary = :placeholder', {
        placeholder: true,
      }),
    );

    db.loadRelationCountAndMap('store.favoriteCount', 'collection.stores', 'store', (qb: any) =>
      qb.andWhere('store.favorite = :placeholder', {
        placeholder: true,
      }),
    );

    db.orderBy('collection.orderby', 'ASC');
    db.addOrderBy('LOWER(collection.title)', 'ASC');

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
    await this.createQueryBuilder().delete().where('id = :id', { id: collectionId }).execute();

    // Shift right node.
    await this.createQueryBuilder()
      .update(Collection)
      .set({ right_id: () => 'right_id - 2' })
      .where({ left_id: LessThan(row.right_id), right_id: MoreThan(row.right_id) })
      .execute();

    // Shift left + right nodes.
    await this.createQueryBuilder()
      .update(Collection)
      .set({ left_id: () => 'left_id - 2', right_id: () => 'right_id - 2' })
      .where({ left_id: MoreThan(row.right_id) })
      .execute();

    return children;
  },

  async updateCollectionCount(collectionId: number, total: number) {
    return this.createQueryBuilder().update(Collection).set({ count: total }).where('id = :id', { id: collectionId }).execute();
  },

  async updateCollectionCounts(items: any[]) {
    return items.forEach(async (item) => {
      return await this.createQueryBuilder()
        .update(Collection)
        .set({ count: item.total })
        .where('id = :id', { id: item.collection_id })
        .execute();
    });
  },

  updateCollection(collectionId: number, data: any) {
    return this.createQueryBuilder().update(Collection).set(data).where('id = :id', { id: collectionId }).execute();
  },

  async updateCollectionIds(ids: any[], options: any) {
    return await this.createQueryBuilder().update(Collection).set(options).where('collection.id IN (:...ids)', { ids }).execute();
  },

  async resetEnabled() {
    return this.createQueryBuilder().update(Collection).set({ enabled: 0 }).execute();
  },

  async createCollection(args: any) {
    return args?.parentId ? await this.createChild(args.parentId, args.title) : await this.createParent(args.title);
  },

  fetchParents(row: Collection, target?: boolean, entities?: boolean) {
    let conditionA = target ? MoreThanOrEqual(row.right_id) : MoreThan(row.right_id);
    let conditionB = target ? LessThanOrEqual(row.left_id) : LessThan(row.left_id);
    let columns = entities ? ['collection.*'] : ['collection.id', 'id'];
    return this.createQueryBuilder().select(columns).where({ right_id: conditionA, left_id: conditionB }).getRawMany();
  },

  fetchChildren(row: Collection, target?: boolean, entities?: boolean) {
    let conditionA = target ? LessThanOrEqual(row.right_id) : LessThan(row.right_id);
    let conditionB = target ? MoreThanOrEqual(row.left_id) : MoreThan(row.left_id);
    let columns = entities ? ['collection.*'] : ['collection.id', 'id'];
    return this.createQueryBuilder().select(columns).where({ right_id: conditionA, left_id: conditionB }).getRawMany();
  },

  async createParent(title: string) {
    const data = await this.createQueryBuilder()
      .select('MAX(collection.right_id)', 'right_id')
      .addSelect('MAX(collection.orderby)', 'orderby')
      .getRawOne();

    return await this.createQueryBuilder()
      .insert()
      .into(Collection)
      .values({
        title: title,
        parent_id: 0,
        left_id: data.right_id + 1,
        right_id: data.right_id + 2,
        orderby: data.orderby + 1,
      })
      .execute();
  },

  async createChild(parentId: number, title: string) {
    const row = await this.findOne({ where: { id: parentId } });

    this.createQueryBuilder()
      .update(Collection)
      .set({ left_id: () => 'left_id + 2', right_id: () => 'right_id + 2' })
      .where({ left_id: MoreThan(row.right_id) })
      .execute();

    this.createQueryBuilder()
      .update(Collection)
      .set({ right_id: () => 'right_id + 2' })
      .where({ left_id: LessThanOrEqual(row.left_id), right_id: MoreThanOrEqual(row.left_id) })
      .execute();

    return await this.createQueryBuilder()
      .insert()
      .into(Collection)
      .values({
        title: title,
        parent_id: parentId,
        left_id: row.right_id,
        right_id: row.right_id + 1,
        orderby: row.orderby + 1,
      })
      .execute();
  },

  async moveCollection(collectionId: number, newParentId: number, newIndex: number) {
    const node = await this.findOne({ where: { id: collectionId } });
    if (!node) return;

    const width = node.right_id - node.left_id + 1;

    // 1. Collect all IDs in the subtree being moved
    const subtreeNodes = await this.createQueryBuilder('collection')
      .select('collection.id', 'id')
      .where('collection.left_id >= :left AND collection.right_id <= :right', {
        left: node.left_id,
        right: node.right_id,
      })
      .getRawMany();
    const subtreeIds = subtreeNodes.map((n: any) => n.id);

    // 2. Temporarily negate the subtree's left/right to take it "out of the tree"
    await this.createQueryBuilder()
      .update(Collection)
      .set({ left_id: () => '0 - left_id', right_id: () => '0 - right_id' })
      .where('id IN (:...ids)', { ids: subtreeIds })
      .execute();

    // 3. Close the gap left by the removed subtree
    await this.createQueryBuilder()
      .update(Collection)
      .set({ left_id: () => `left_id - ${width}` })
      .where('left_id > :right', { right: node.right_id })
      .execute();

    await this.createQueryBuilder()
      .update(Collection)
      .set({ right_id: () => `right_id - ${width}` })
      .where('right_id > :right', { right: node.right_id })
      .execute();

    // 4. Determine the insertion point
    let insertAt: number;
    if (newParentId === 0) {
      // Moving to root level
      const siblings = await this.createQueryBuilder('collection')
        .where('collection.parent_id = 0')
        .andWhere('collection.id NOT IN (:...ids)', { ids: subtreeIds })
        .orderBy('collection.orderby', 'ASC')
        .addOrderBy('LOWER(collection.title)', 'ASC')
        .getMany();

      if (newIndex >= siblings.length) {
        // Insert after the last root sibling
        const lastSibling = siblings[siblings.length - 1];
        insertAt = lastSibling ? lastSibling.right_id + 1 : 1;
      } else {
        insertAt = siblings[newIndex].left_id;
      }
    } else {
      // Moving into a parent
      const parent = await this.findOne({ where: { id: newParentId } });
      if (!parent) return;

      const siblings = await this.createQueryBuilder('collection')
        .where('collection.parent_id = :parentId', { parentId: newParentId })
        .andWhere('collection.id NOT IN (:...ids)', { ids: subtreeIds })
        .orderBy('collection.orderby', 'ASC')
        .addOrderBy('LOWER(collection.title)', 'ASC')
        .getMany();

      if (newIndex >= siblings.length) {
        insertAt = parent.right_id;
      } else {
        insertAt = siblings[newIndex].left_id;
      }
    }

    // 5. Open a gap at the insertion point
    await this.createQueryBuilder()
      .update(Collection)
      .set({ right_id: () => `right_id + ${width}` })
      .where('right_id >= :insertAt', { insertAt })
      .execute();

    await this.createQueryBuilder()
      .update(Collection)
      .set({ left_id: () => `left_id + ${width}` })
      .where('left_id >= :insertAt', { insertAt })
      .execute();

    // 6. Move the subtree into the gap
    const offset = insertAt - node.left_id;
    await this.createQueryBuilder()
      .update(Collection)
      .set({
        left_id: () => `0 - left_id + ${offset}`,
        right_id: () => `0 - right_id + ${offset}`,
      })
      .where('id IN (:...ids)', { ids: subtreeIds })
      .execute();

    // 7. Update the parent_id of the moved node (not its descendants)
    await this.createQueryBuilder().update(Collection).set({ parent_id: newParentId }).where('id = :id', { id: collectionId }).execute();

    // 8. Update orderby for all siblings at the new level
    const newSiblings = await this.createQueryBuilder('collection')
      .where('collection.parent_id = :parentId', { parentId: newParentId })
      .orderBy('collection.left_id', 'ASC')
      .getMany();

    for (let i = 0; i < newSiblings.length; i++) {
      await this.createQueryBuilder().update(Collection).set({ orderby: i }).where('id = :id', { id: newSiblings[i].id }).execute();
    }
  },

  async createSystemCollection() {
    const data = await this.createQueryBuilder()
      .select('MAX(collection.right_id)', 'right_id')
      .addSelect('MAX(collection.orderby)', 'orderby')
      .getRawOne();

    return await this.createQueryBuilder()
      .insert()
      .into(Collection)
      .values({
        title: 'System Fonts',
        parent_id: 0,
        is_system: 1,
        left_id: data.right_id + 1,
        right_id: data.right_id + 2,
        orderby: data.orderby + 1,
      })
      .execute();
  },
};
