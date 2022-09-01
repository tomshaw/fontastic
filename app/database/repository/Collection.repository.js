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
    updateCollection(options) {
        return this.createQueryBuilder().update(entity_1.Collection)
            .set(options)
            .where("id = :id", { id: options.id })
            .execute();
    },
    resetEnabled() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.createQueryBuilder().update(entity_1.Collection)
                .set({ enabled: 0 })
                .execute();
        });
    },
    createCollection(parentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return (parentId) ? yield this.createChild(parentId) : yield this.createParent();
        });
    },
    fetchParents(range, target, entities) {
        let conditionA = (target) ? (0, typeorm_1.MoreThanOrEqual)(range.right_id) : (0, typeorm_1.MoreThan)(range.right_id);
        let conditionB = (target) ? (0, typeorm_1.LessThanOrEqual)(range.left_id) : (0, typeorm_1.LessThan)(range.left_id);
        let columns = (entities) ? ["collection.*"] : ["collection.id", "id"];
        return this.createQueryBuilder()
            .select(columns)
            .where({ right_id: conditionA, left_id: conditionB })
            .getRawMany();
    },
    fetchChildren(range, target, entities) {
        let conditionA = (target) ? (0, typeorm_1.LessThanOrEqual)(range.right_id) : (0, typeorm_1.LessThan)(range.right_id);
        let conditionB = (target) ? (0, typeorm_1.MoreThanOrEqual)(range.left_id) : (0, typeorm_1.MoreThan)(range.left_id);
        let columns = (entities) ? ["collection.*"] : ["collection.id", "id"];
        return this.createQueryBuilder()
            .select(columns)
            .where({ right_id: conditionA, left_id: conditionB })
            .getRawMany();
    },
    createParent() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.createQueryBuilder()
                .select("MAX(collection.right_id)", "right_id")
                .addSelect("MAX(collection.orderby)", "orderby")
                .getRawOne();
            return yield this.createQueryBuilder().insert().into(entity_1.Collection).values({
                title: 'New Collection',
                parent_id: 0,
                left_id: data.right_id + 1,
                right_id: data.right_id + 2,
                orderby: data.orderby + 1
            }).execute();
        });
    },
    createChild(id) {
        return __awaiter(this, void 0, void 0, function* () {
            //const row = await this.findOne({ id: id });
            const row = yield this.findOne({ where: { id: id } });
            this.createQueryBuilder().update(entity_1.Collection)
                .set({ left_id: () => "left_id + 2", right_id: () => "right_id + 2" })
                .where({ left_id: (0, typeorm_1.MoreThan)(row.right_id) })
                .execute();
            this.createQueryBuilder().update(entity_1.Collection)
                .set({ right_id: () => "right_id + 2" })
                .where({ left_id: (0, typeorm_1.LessThanOrEqual)(row.left_id), right_id: (0, typeorm_1.MoreThanOrEqual)(row.left_id) })
                .execute();
            return yield this.createQueryBuilder().insert().into(entity_1.Collection).values({
                title: 'New Collection',
                parent_id: id,
                left_id: row.right_id,
                right_id: row.right_id + 1,
                orderby: row.orderby + 1
            }).execute();
        });
    }
};
//# sourceMappingURL=Collection.repository.js.map