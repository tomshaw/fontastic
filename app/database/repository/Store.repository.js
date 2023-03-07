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
exports.StoreRepository = void 0;
const typeorm_1 = require("typeorm");
const entity_1 = require("../entity");
const config_1 = require("../../config");
exports.StoreRepository = {
    search(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = this.createQueryBuilder();
            if (options.where && options.where.length) {
                const where = options.where;
                const builder = [];
                let isAndWhere = false;
                const hasSearchTerm = where.some((item) => item.key === 'term');
                if (hasSearchTerm) {
                    const searchTerm = where.find((item) => item.key === 'term');
                    config_1.searchDbColumns.forEach((item) => {
                        builder.push({
                            key: item,
                            type: 'like',
                            value: searchTerm.value.toLowerCase()
                        });
                    });
                }
                const hasFileTypes = where.some((item) => item.key === 'file_type');
                if (hasFileTypes) {
                    const fileTypes = where.find((item) => item.key === 'file_type');
                    if (fileTypes && fileTypes.value.length) {
                        isAndWhere = true;
                        db.where(`${fileTypes.key} IN (:...mimes)`, { mimes: fileTypes.value });
                    }
                }
                if (isAndWhere) {
                    db.andWhere(new typeorm_1.Brackets((qb) => {
                        builder.forEach((item, i) => {
                            const column = item.key;
                            const value = item.value;
                            if (i === 0) {
                                qb.where(`LOWER(${column}) LIKE :placeholder`, { placeholder: `%${value}%` });
                            }
                            else {
                                qb.orWhere(`LOWER(${column}) LIKE :placeholder`, { placeholder: `%${value}%` });
                            }
                        });
                    }));
                }
                else {
                    builder.forEach((item, i) => {
                        const column = item.key;
                        const value = item.value;
                        if (i === 0) {
                            db.where(`LOWER(${column}) LIKE :placeholder`, { placeholder: `%${value}%` });
                        }
                        else {
                            db.orWhere(`LOWER(${column}) LIKE :placeholder`, { placeholder: `%${value}%` });
                        }
                    });
                }
            }
            if (options.take) {
                db.limit(options.take);
            }
            if (options.skip) {
                db.offset(options.skip);
            }
            if (options.order && options.order.column) {
                const direction = (options.order.direction === 'DESC') ? 'DESC' : 'ASC';
                db.orderBy(`store.${options.order.column}`, direction);
            }
            // console.log(db.printSql());
            // console.log(db.getSql());
            // console.log(db.getQuery());
            return yield db.getManyAndCount();
        });
    },
    fetch(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = this.createQueryBuilder();
            if (options.ids && options.ids.length) {
                db.where("store.collection_id IN (:...ids)", { ids: options.ids });
            }
            else if (options.where && options.where.length) {
                options.where.forEach((item, i) => {
                    let column = item.key;
                    let value = item.value;
                    if (i === 0) {
                        db.where(`${column} = :placeholder`, { placeholder: value });
                    }
                    else {
                        db.andWhere(`${column} = :placeholder`, { placeholder: value });
                    }
                });
            }
            if (options.take) {
                db.limit(options.take);
            }
            if (options.skip) {
                db.offset(options.skip);
            }
            if (options.order && options.order.column) {
                const direction = (options.order.direction === 'DESC') ? 'DESC' : 'ASC';
                db.orderBy(`store.${options.order.column}`, direction);
            }
            // console.log(db.printSql());
            // console.log(db.getSql());
            // console.log(db.getQuery());
            return yield db.getManyAndCount();
        });
    },
    update(id, data) {
        return this.createQueryBuilder().update(entity_1.Store)
            .set(data)
            .where("id = :id", { id: id })
            .execute();
    },
    activateByIds(ids, activated) {
        return this.createQueryBuilder().update(entity_1.Store)
            .set({ activated: activated })
            .where("id IN (:...ids)", { ids: ids })
            .execute();
    },
    temporaryByIds(ids, activated) {
        return this.createQueryBuilder().update(entity_1.Store)
            .set({ temporary: activated })
            .where("id IN (:...ids)", { ids: ids })
            .execute();
    },
    activateCollection(collectionId, activated) {
        return this.createQueryBuilder().update(entity_1.Store)
            .set({ activated: activated })
            .where("collection_id = :id", { id: collectionId })
            .execute();
    },
    temporaryCollection(collectionId, activated) {
        return this.createQueryBuilder().update(entity_1.Store)
            .set({ temporary: activated })
            .where("collection_id = :id", { id: collectionId })
            .execute();
    },
    resetTemporaryFonts(uptime) {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield this.createQueryBuilder().where("store.temporary = 1").getMany();
            const now = new Date().getTime();
            rows.forEach((row) => {
                let updated = new Date(row.updated).getTime() + (1000 * uptime);
                if (updated < now) {
                    this.createQueryBuilder().update(entity_1.Store).set({ temporary: 0 }).where("id = :id", { id: row.id }).execute();
                }
            });
            return rows;
        });
    },
    deleteCollection(collectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.createQueryBuilder().delete().where("collection_id = :id", { id: collectionId }).execute();
        });
    },
    resetSystem() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.createQueryBuilder().delete().where("store.system = 1").execute();
        });
    },
    resetFavorites() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.createQueryBuilder().update(entity_1.Store).set({ favorite: 0 }).where("store.favorite = 1").execute();
        });
    },
    resetActivated() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.createQueryBuilder().update(entity_1.Store).set({ activated: 0 }).where("store.activated = 1").execute();
        });
    },
    syncActivated() {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield this.createQueryBuilder("store").select(['store.file_name']).where("store.system = 1").getMany();
            const fileNames = results.map((item) => item.file_name);
            return yield this.createQueryBuilder()
                .update(entity_1.Store)
                .set({ activated: 1 })
                .where("store.system = 0")
                .andWhere("store.file_name IN (:...names)", { names: fileNames })
                //.getQuery();
                .execute();
        });
    },
    fetchCollectionItems(collectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.createQueryBuilder()
                .select("store.id", "id")
                .where({ collection_id: (0, typeorm_1.Equal)(collectionId) })
                .getRawMany();
        });
    },
    fetchCollectionCount(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.createQueryBuilder()
                .select("COUNT(*)", "total")
                .where("store.collection_id = :id", { id: id })
                .getRawOne();
        });
    },
    fetchCollectionsCount() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.createQueryBuilder()
                .select("store.collection_id", "collection_id")
                .addSelect("COUNT(*)", "total")
                .groupBy("store.collection_id")
                .getRawMany();
        });
    },
    create(item) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = {};
            data.collection_id = item.collection_id;
            data.file_name = (item.file_name) ? item.file_name : "";
            data.file_path = (item.file_path) ? item.file_path : "";
            data.file_size = (item.file_size) ? item.file_size : 0;
            data.file_size_pretty = (item.file_size_pretty) ? item.file_size_pretty : "";
            data.file_type = (item.file_type) ? item.file_type : "";
            data.installable = (item.installable) ? item.installable : 0;
            data.activated = (item.activated) ? item.activated : 0;
            data.temporary = (item.temporary) ? item.temporary : 0;
            data.favorite = (item.favorite) ? item.favorite : 0;
            data.system = (item.system) ? item.system : 0;
            if (item.compatible_full_name && item.compatible_full_name !== '') {
                data.compatible_full_name = item.compatible_full_name;
            }
            if (item.copyright && item.copyright !== '') {
                data.copyright = item.copyright;
            }
            if (item.description && item.description !== '') {
                data.description = item.description;
            }
            if (item.designer && item.designer !== '') {
                data.designer = item.designer;
            }
            if (item.designer_url && item.designer_url !== '') {
                data.designer_url = item.designer_url;
            }
            if (item.font_family && item.font_family !== '') {
                data.font_family = item.font_family;
            }
            if (item.font_subfamily && item.font_subfamily !== '') {
                data.font_subfamily = item.font_subfamily;
            }
            if (item.full_name && item.full_name !== '') {
                data.full_name = item.full_name;
            }
            if (item.license && item.license !== '') {
                data.license = item.license;
            }
            if (item.license_url && item.license_url !== '') {
                data.license_url = item.license_url;
            }
            if (item.manufacturer && item.manufacturer !== '') {
                data.manufacturer = item.manufacturer;
            }
            if (item.manufacturer_url && item.manufacturer_url !== '') {
                data.manufacturer_url = item.manufacturer_url;
            }
            if (item.post_script_name && item.post_script_name !== '') {
                data.post_script_name = item.post_script_name;
            }
            if (item.preferred_family && item.preferred_family !== '') {
                data.preferred_family = item.preferred_family;
            }
            if (item.preferred_sub_family && item.preferred_sub_family !== '') {
                data.preferred_sub_family = item.preferred_sub_family;
            }
            if (item.sample_text && item.sample_text !== '') {
                data.sample_text = item.sample_text;
            }
            if (item.trademark && item.trademark !== '') {
                data.trademark = item.trademark;
            }
            if (item.unique_id && item.unique_id !== '') {
                data.unique_id = item.unique_id;
            }
            if (item.version && item.version !== '') {
                data.version = item.version;
            }
            //@todo Log errors in log table.
            return yield this.createQueryBuilder().insert().into(entity_1.Store).values(data).execute().catch((err) => console.log('insert-error', err));
        });
    },
    fetchSystemStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const rowCount = yield this.createQueryBuilder()
                .select("COUNT(*)", "total")
                .getRawOne();
            const activatedCount = yield this.createQueryBuilder()
                .select("COUNT(*)", "total")
                .where("store.activated = 1")
                .andWhere("store.system = 0")
                .getRawOne();
            const favoriteCount = yield this.createQueryBuilder()
                .select("COUNT(*)", "total")
                .where("store.favorite = 1")
                .getRawOne();
            const systemCount = yield this.createQueryBuilder()
                .select("COUNT(*)", "total")
                .where("store.system = 1")
                .getRawOne();
            const temporaryCount = yield this.createQueryBuilder()
                .select("COUNT(*)", "total")
                .where("store.temporary = 1")
                .getRawOne();
            return {
                rowCount: rowCount.total,
                activatedCount: activatedCount.total,
                favoriteCount: favoriteCount.total,
                systemCount: systemCount.total,
                temporaryCount: temporaryCount.total
            };
        });
    }
};
//# sourceMappingURL=Store.repository.js.map