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
            const db = this.createQueryBuilder("collection");
            db.where("collection.is_system = 0");
            db.leftJoinAndSelect("collection.stores", "store");
            // db.leftJoin("collection.stores", "store")
            db.loadRelationCountAndMap('store.storeCount', 'collection.stores'); // correct
            db.loadRelationCountAndMap('store.installableCount', 'collection.stores', "store", (qb) => qb.andWhere("store.installable = :placeholder", {
                placeholder: true,
            }));
            db.loadRelationCountAndMap('store.activatedCount', 'collection.stores', "store", (qb) => qb.andWhere("store.activated = :placeholder", {
                placeholder: true,
            }));
            db.loadRelationCountAndMap('store.temporaryCount', 'collection.stores', "store", (qb) => qb.andWhere("store.temporary = :placeholder", {
                placeholder: true,
            }));
            db.loadRelationCountAndMap('store.favoriteCount', 'collection.stores', "store", (qb) => qb.andWhere("store.favorite = :placeholder", {
                placeholder: true,
            }));
            db.orderBy(`LOWER(collection.title)`, 'ASC');
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
            yield this.createQueryBuilder().delete().where("id = :id", { id: collectionId }).execute();
            // Shift right node.
            yield this.createQueryBuilder().update(entity_1.Collection)
                .set({ right_id: () => "right_id - 2" })
                .where({ left_id: (0, typeorm_1.LessThan)(row.right_id), right_id: (0, typeorm_1.MoreThan)(row.right_id) })
                .execute();
            // Shift left + right nodes.
            yield this.createQueryBuilder().update(entity_1.Collection)
                .set({ left_id: () => "left_id - 2", right_id: () => "right_id - 2" })
                .where({ left_id: (0, typeorm_1.MoreThan)(row.right_id) })
                .execute();
            return children;
        });
    },
    updateCollectionCount(collectionId, total) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.createQueryBuilder().update(entity_1.Collection)
                .set({ count: total })
                .where("id = :id", { id: collectionId })
                .execute();
        });
    },
    updateCollectionCounts(items) {
        return __awaiter(this, void 0, void 0, function* () {
            return items.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                return yield this.createQueryBuilder()
                    .update(entity_1.Collection)
                    .set({ count: item.total })
                    .where("id = :id", { id: item.collection_id })
                    .execute();
            }));
        });
    },
    updateCollection(collectionId, data) {
        return this.createQueryBuilder().update(entity_1.Collection)
            .set(data)
            .where("id = :id", { id: collectionId })
            .execute();
    },
    updateCollectionIds(ids, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.createQueryBuilder()
                .update(entity_1.Collection)
                .set(options)
                .where("collection.id IN (:...ids)", { ids })
                .execute();
        });
    },
    resetEnabled() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.createQueryBuilder().update(entity_1.Collection)
                .set({ enabled: 0 })
                .execute();
        });
    },
    createCollection(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return (args === null || args === void 0 ? void 0 : args.parentId) ? yield this.createChild(args.parentId, args.title) : yield this.createParent(args.title);
        });
    },
    fetchParents(row, target, entities) {
        let conditionA = (target) ? (0, typeorm_1.MoreThanOrEqual)(row.right_id) : (0, typeorm_1.MoreThan)(row.right_id);
        let conditionB = (target) ? (0, typeorm_1.LessThanOrEqual)(row.left_id) : (0, typeorm_1.LessThan)(row.left_id);
        let columns = (entities) ? ["collection.*"] : ["collection.id", "id"];
        return this.createQueryBuilder()
            .select(columns)
            .where({ right_id: conditionA, left_id: conditionB })
            .getRawMany();
    },
    fetchChildren(row, target, entities) {
        let conditionA = (target) ? (0, typeorm_1.LessThanOrEqual)(row.right_id) : (0, typeorm_1.LessThan)(row.right_id);
        let conditionB = (target) ? (0, typeorm_1.MoreThanOrEqual)(row.left_id) : (0, typeorm_1.MoreThan)(row.left_id);
        let columns = (entities) ? ["collection.*"] : ["collection.id", "id"];
        return this.createQueryBuilder()
            .select(columns)
            .where({ right_id: conditionA, left_id: conditionB })
            .getRawMany();
    },
    createParent(title) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.createQueryBuilder()
                .select("MAX(collection.right_id)", "right_id")
                .addSelect("MAX(collection.orderby)", "orderby")
                .getRawOne();
            return yield this.createQueryBuilder().insert().into(entity_1.Collection).values({
                title: title,
                parent_id: 0,
                left_id: data.right_id + 1,
                right_id: data.right_id + 2,
                orderby: data.orderby + 1
            }).execute();
        });
    },
    createChild(parentId, title) {
        return __awaiter(this, void 0, void 0, function* () {
            const row = yield this.findOne({ where: { id: parentId } });
            this.createQueryBuilder().update(entity_1.Collection)
                .set({ left_id: () => "left_id + 2", right_id: () => "right_id + 2" })
                .where({ left_id: (0, typeorm_1.MoreThan)(row.right_id) })
                .execute();
            this.createQueryBuilder().update(entity_1.Collection)
                .set({ right_id: () => "right_id + 2" })
                .where({ left_id: (0, typeorm_1.LessThanOrEqual)(row.left_id), right_id: (0, typeorm_1.MoreThanOrEqual)(row.left_id) })
                .execute();
            return yield this.createQueryBuilder().insert().into(entity_1.Collection).values({
                title: title,
                parent_id: parentId,
                left_id: row.right_id,
                right_id: row.right_id + 1,
                orderby: row.orderby + 1
            }).execute();
        });
    },
    createSystemCollection() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.createQueryBuilder()
                .select("MAX(collection.right_id)", "right_id")
                .addSelect("MAX(collection.orderby)", "orderby")
                .getRawOne();
            return yield this.createQueryBuilder().insert().into(entity_1.Collection).values({
                title: 'System Fonts',
                parent_id: 0,
                is_system: 1,
                left_id: data.right_id + 1,
                right_id: data.right_id + 2,
                orderby: data.orderby + 1
            }).execute();
        });
    }
};
//# sourceMappingURL=Collection.repository.js.map