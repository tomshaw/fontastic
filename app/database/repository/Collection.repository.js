"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionRepository = void 0;
const typeorm_1 = require("typeorm");
const entity_1 = require("../entity");
exports.CollectionRepository = {
    fetchCollectionsWithCounts(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = this.createQueryBuilder('collection');
            db.where('collection.is_system = 0');
            db.leftJoin('collection.stores', 'store');
            db.loadRelationCountAndMap('store.storeCount', 'collection.stores'); // correct
            db.loadRelationCountAndMap('store.installableCount', 'collection.stores', 'store', (qb) => qb.andWhere('store.installable = :placeholder', {
                placeholder: true,
            }));
            db.loadRelationCountAndMap('store.temporaryCount', 'collection.stores', 'store', (qb) => qb.andWhere('store.temporary = :placeholder', {
                placeholder: true,
            }));
            db.loadRelationCountAndMap('store.favoriteCount', 'collection.stores', 'store', (qb) => qb.andWhere('store.favorite = :placeholder', {
                placeholder: true,
            }));
            db.orderBy('collection.orderby', 'ASC');
            db.addOrderBy('LOWER(collection.title)', 'ASC');
            return yield db.getMany();
        });
    },
    deleteCollection(collectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const row = yield this.findOne({ where: { id: collectionId } });
            // Item cannot be found.
            if (!row)
                return;
            const children = yield this.fetchChildren(row, false, true);
            // const parents = await this.fetchParents(row);
            // Item has children cannot be deleted.
            if (children.length)
                return;
            // Delete row.
            yield this.createQueryBuilder().delete().where('id = :id', { id: collectionId }).execute();
            // Shift right node.
            yield this.createQueryBuilder()
                .update(entity_1.Collection)
                .set({ right_id: () => 'right_id - 2' })
                .where({ left_id: (0, typeorm_1.LessThan)(row.right_id), right_id: (0, typeorm_1.MoreThan)(row.right_id) })
                .execute();
            // Shift left + right nodes.
            yield this.createQueryBuilder()
                .update(entity_1.Collection)
                .set({ left_id: () => 'left_id - 2', right_id: () => 'right_id - 2' })
                .where({ left_id: (0, typeorm_1.MoreThan)(row.right_id) })
                .execute();
            return children;
        });
    },
    updateCollectionCount(collectionId, total) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.createQueryBuilder().update(entity_1.Collection).set({ count: total }).where('id = :id', { id: collectionId }).execute();
        });
    },
    updateCollectionCounts(items) {
        return __awaiter(this, void 0, void 0, function* () {
            return items.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                return yield this.createQueryBuilder()
                    .update(entity_1.Collection)
                    .set({ count: item.total })
                    .where('id = :id', { id: item.collection_id })
                    .execute();
            }));
        });
    },
    updateCollection(collectionId, data) {
        return this.createQueryBuilder().update(entity_1.Collection).set(data).where('id = :id', { id: collectionId }).execute();
    },
    updateCollectionIds(ids, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.createQueryBuilder().update(entity_1.Collection).set(options).where('collection.id IN (:...ids)', { ids }).execute();
        });
    },
    resetEnabled() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.createQueryBuilder().update(entity_1.Collection).set({ enabled: 0 }).execute();
        });
    },
    createCollection(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return (args === null || args === void 0 ? void 0 : args.parentId) ? yield this.createChild(args.parentId, args.title) : yield this.createParent(args.title);
        });
    },
    fetchParents(row, target, entities) {
        let conditionA = target ? (0, typeorm_1.MoreThanOrEqual)(row.right_id) : (0, typeorm_1.MoreThan)(row.right_id);
        let conditionB = target ? (0, typeorm_1.LessThanOrEqual)(row.left_id) : (0, typeorm_1.LessThan)(row.left_id);
        let columns = entities ? ['collection.*'] : ['collection.id', 'id'];
        return this.createQueryBuilder().select(columns).where({ right_id: conditionA, left_id: conditionB }).getRawMany();
    },
    fetchChildren(row, target, entities) {
        let conditionA = target ? (0, typeorm_1.LessThanOrEqual)(row.right_id) : (0, typeorm_1.LessThan)(row.right_id);
        let conditionB = target ? (0, typeorm_1.MoreThanOrEqual)(row.left_id) : (0, typeorm_1.MoreThan)(row.left_id);
        let columns = entities ? ['collection.*'] : ['collection.id', 'id'];
        return this.createQueryBuilder().select(columns).where({ right_id: conditionA, left_id: conditionB }).getRawMany();
    },
    createParent(title) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.createQueryBuilder()
                .select('MAX(collection.right_id)', 'right_id')
                .addSelect('MAX(collection.orderby)', 'orderby')
                .getRawOne();
            return yield this.createQueryBuilder()
                .insert()
                .into(entity_1.Collection)
                .values({
                title: title,
                parent_id: 0,
                left_id: data.right_id + 1,
                right_id: data.right_id + 2,
                orderby: data.orderby + 1,
            })
                .execute();
        });
    },
    createChild(parentId, title) {
        return __awaiter(this, void 0, void 0, function* () {
            const row = yield this.findOne({ where: { id: parentId } });
            this.createQueryBuilder()
                .update(entity_1.Collection)
                .set({ left_id: () => 'left_id + 2', right_id: () => 'right_id + 2' })
                .where({ left_id: (0, typeorm_1.MoreThan)(row.right_id) })
                .execute();
            this.createQueryBuilder()
                .update(entity_1.Collection)
                .set({ right_id: () => 'right_id + 2' })
                .where({ left_id: (0, typeorm_1.LessThanOrEqual)(row.left_id), right_id: (0, typeorm_1.MoreThanOrEqual)(row.left_id) })
                .execute();
            return yield this.createQueryBuilder()
                .insert()
                .into(entity_1.Collection)
                .values({
                title: title,
                parent_id: parentId,
                left_id: row.right_id,
                right_id: row.right_id + 1,
                orderby: row.orderby + 1,
            })
                .execute();
        });
    },
    moveCollection(collectionId, newParentId, newIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const node = yield this.findOne({ where: { id: collectionId } });
            if (!node)
                return;
            const width = node.right_id - node.left_id + 1;
            // 1. Collect all IDs in the subtree being moved
            const subtreeNodes = yield this.createQueryBuilder('collection')
                .select('collection.id', 'id')
                .where('collection.left_id >= :left AND collection.right_id <= :right', {
                left: node.left_id,
                right: node.right_id,
            })
                .getRawMany();
            const subtreeIds = subtreeNodes.map((n) => n.id);
            // 2. Temporarily negate the subtree's left/right to take it "out of the tree"
            yield this.createQueryBuilder()
                .update(entity_1.Collection)
                .set({ left_id: () => '0 - left_id', right_id: () => '0 - right_id' })
                .where('id IN (:...ids)', { ids: subtreeIds })
                .execute();
            // 3. Close the gap left by the removed subtree
            yield this.createQueryBuilder()
                .update(entity_1.Collection)
                .set({ left_id: () => `left_id - ${width}` })
                .where('left_id > :right', { right: node.right_id })
                .execute();
            yield this.createQueryBuilder()
                .update(entity_1.Collection)
                .set({ right_id: () => `right_id - ${width}` })
                .where('right_id > :right', { right: node.right_id })
                .execute();
            // 4. Determine the insertion point
            let insertAt;
            if (newParentId === 0) {
                // Moving to root level
                const siblings = yield this.createQueryBuilder('collection')
                    .where('collection.parent_id = 0')
                    .andWhere('collection.id NOT IN (:...ids)', { ids: subtreeIds })
                    .orderBy('collection.orderby', 'ASC')
                    .addOrderBy('LOWER(collection.title)', 'ASC')
                    .getMany();
                if (newIndex >= siblings.length) {
                    // Insert after the last root sibling
                    const lastSibling = siblings[siblings.length - 1];
                    insertAt = lastSibling ? lastSibling.right_id + 1 : 1;
                }
                else {
                    insertAt = siblings[newIndex].left_id;
                }
            }
            else {
                // Moving into a parent
                const parent = yield this.findOne({ where: { id: newParentId } });
                if (!parent)
                    return;
                const siblings = yield this.createQueryBuilder('collection')
                    .where('collection.parent_id = :parentId', { parentId: newParentId })
                    .andWhere('collection.id NOT IN (:...ids)', { ids: subtreeIds })
                    .orderBy('collection.orderby', 'ASC')
                    .addOrderBy('LOWER(collection.title)', 'ASC')
                    .getMany();
                if (newIndex >= siblings.length) {
                    insertAt = parent.right_id;
                }
                else {
                    insertAt = siblings[newIndex].left_id;
                }
            }
            // 5. Open a gap at the insertion point
            yield this.createQueryBuilder()
                .update(entity_1.Collection)
                .set({ right_id: () => `right_id + ${width}` })
                .where('right_id >= :insertAt', { insertAt })
                .execute();
            yield this.createQueryBuilder()
                .update(entity_1.Collection)
                .set({ left_id: () => `left_id + ${width}` })
                .where('left_id >= :insertAt', { insertAt })
                .execute();
            // 6. Move the subtree into the gap
            const offset = insertAt - node.left_id;
            yield this.createQueryBuilder()
                .update(entity_1.Collection)
                .set({
                left_id: () => `0 - left_id + ${offset}`,
                right_id: () => `0 - right_id + ${offset}`,
            })
                .where('id IN (:...ids)', { ids: subtreeIds })
                .execute();
            // 7. Update the parent_id of the moved node (not its descendants)
            yield this.createQueryBuilder().update(entity_1.Collection).set({ parent_id: newParentId }).where('id = :id', { id: collectionId }).execute();
            // 8. Update orderby for all siblings at the new level
            const newSiblings = yield this.createQueryBuilder('collection')
                .where('collection.parent_id = :parentId', { parentId: newParentId })
                .orderBy('collection.left_id', 'ASC')
                .getMany();
            for (let i = 0; i < newSiblings.length; i++) {
                yield this.createQueryBuilder().update(entity_1.Collection).set({ orderby: i }).where('id = :id', { id: newSiblings[i].id }).execute();
            }
        });
    },
    createSystemCollection() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.createQueryBuilder()
                .select('MAX(collection.right_id)', 'right_id')
                .addSelect('MAX(collection.orderby)', 'orderby')
                .getRawOne();
            return yield this.createQueryBuilder()
                .insert()
                .into(entity_1.Collection)
                .values({
                title: 'System Fonts',
                parent_id: 0,
                is_system: 1,
                left_id: data.right_id + 1,
                right_id: data.right_id + 2,
                orderby: data.orderby + 1,
            })
                .execute();
        });
    },
};
//# sourceMappingURL=Collection.repository.js.map