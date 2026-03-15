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
                const andConditions = [];
                // Search term with optional field restriction
                const hasSearchTerm = where.some((item) => item.key === 'term');
                if (hasSearchTerm) {
                    const searchTerm = where.find((item) => item.key === 'term');
                    const searchFieldsEntry = where.find((item) => item.key === 'search_fields');
                    const columns = searchFieldsEntry && searchFieldsEntry.value.length > 0 ? searchFieldsEntry.value : config_1.searchDbColumns;
                    const value = searchTerm.value.toLowerCase();
                    andConditions.push((qb) => {
                        columns.forEach((col, i) => {
                            if (i === 0) {
                                qb.where(`LOWER(${col}) LIKE :term`, { term: `%${value}%` });
                            }
                            else {
                                qb.orWhere(`LOWER(${col}) LIKE :term`, { term: `%${value}%` });
                            }
                        });
                    });
                }
                // File type filter
                const hasFileTypes = where.some((item) => item.key === 'file_type');
                if (hasFileTypes) {
                    const fileTypes = where.find((item) => item.key === 'file_type');
                    if (fileTypes && fileTypes.value.length) {
                        andConditions.push((qb) => {
                            qb.where(`file_type IN (:...mimes)`, { mimes: fileTypes.value });
                        });
                    }
                }
                // Status filters
                const favoriteEntry = where.find((item) => item.key === 'favorite');
                if (favoriteEntry) {
                    andConditions.push((qb) => {
                        qb.where(`store.favorite = :fav`, { fav: favoriteEntry.value });
                    });
                }
                const systemEntry = where.find((item) => item.key === 'system');
                if (systemEntry) {
                    andConditions.push((qb) => {
                        qb.where(`store.system = :sys`, { sys: systemEntry.value });
                    });
                }
                const installableEntry = where.find((item) => item.key === 'installable');
                if (installableEntry) {
                    andConditions.push((qb) => {
                        qb.where(`store.installable = :inst`, { inst: installableEntry.value });
                    });
                }
                // Collection filter
                const collectionEntry = where.find((item) => item.key === 'collection_id');
                if (collectionEntry) {
                    andConditions.push((qb) => {
                        qb.where(`store.collection_id = :colId`, { colId: collectionEntry.value });
                    });
                }
                // Designer text filter
                const designerEntry = where.find((item) => item.key === 'designer');
                if (designerEntry) {
                    andConditions.push((qb) => {
                        qb.where(`LOWER(store.designer) LIKE :designer`, { designer: `%${designerEntry.value.toLowerCase()}%` });
                    });
                }
                // Manufacturer text filter
                const manufacturerEntry = where.find((item) => item.key === 'manufacturer');
                if (manufacturerEntry) {
                    andConditions.push((qb) => {
                        qb.where(`LOWER(store.manufacturer) LIKE :manufacturer`, { manufacturer: `%${manufacturerEntry.value.toLowerCase()}%` });
                    });
                }
                // Font subfamily text filter
                const subfamilyEntry = where.find((item) => item.key === 'font_subfamily');
                if (subfamilyEntry) {
                    andConditions.push((qb) => {
                        qb.where(`LOWER(store.font_subfamily) LIKE :subfamily`, { subfamily: `%${subfamilyEntry.value.toLowerCase()}%` });
                    });
                }
                // File size range
                const fileSizeMin = where.find((item) => item.key === 'file_size_min');
                if (fileSizeMin) {
                    andConditions.push((qb) => {
                        qb.where(`store.file_size >= :sizeMin`, { sizeMin: fileSizeMin.value });
                    });
                }
                const fileSizeMax = where.find((item) => item.key === 'file_size_max');
                if (fileSizeMax) {
                    andConditions.push((qb) => {
                        qb.where(`store.file_size <= :sizeMax`, { sizeMax: fileSizeMax.value });
                    });
                }
                // Date range
                const dateFrom = where.find((item) => item.key === 'date_from');
                if (dateFrom) {
                    andConditions.push((qb) => {
                        qb.where(`store.created >= :dateFrom`, { dateFrom: dateFrom.value });
                    });
                }
                const dateTo = where.find((item) => item.key === 'date_to');
                if (dateTo) {
                    andConditions.push((qb) => {
                        qb.where(`store.created <= :dateTo`, { dateTo: dateTo.value + ' 23:59:59' });
                    });
                }
                // Apply all conditions with AND logic
                andConditions.forEach((condition, i) => {
                    if (i === 0) {
                        db.where(new typeorm_1.Brackets(condition));
                    }
                    else {
                        db.andWhere(new typeorm_1.Brackets(condition));
                    }
                });
            }
            const MAX_SEARCH_LIMIT = 5000;
            db.limit(Math.min(options.take || 500, MAX_SEARCH_LIMIT));
            if (options.skip) {
                db.offset(options.skip);
            }
            if (options.order && options.order.column) {
                const direction = options.order.direction === 'DESC' ? 'DESC' : 'ASC';
                db.orderBy(`store.${options.order.column}`, direction);
            }
            return yield db.getManyAndCount();
        });
    },
    fetch(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = this.createQueryBuilder();
            if (options.ids && options.ids.length) {
                db.where('store.collection_id IN (:...ids)', { ids: options.ids });
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
                const direction = options.order.direction === 'DESC' ? 'DESC' : 'ASC';
                db.orderBy(`store.${options.order.column}`, direction);
            }
            return yield db.getManyAndCount();
        });
    },
    update(id, data) {
        return this.createQueryBuilder().update(entity_1.Store).set(data).where('id = :id', { id: id }).execute();
    },
    resetTemporaryFonts(uptime) {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield this.createQueryBuilder().where('store.temporary = 1').getMany();
            const now = new Date().getTime();
            rows.forEach((row) => {
                let updated = new Date(row.updated).getTime() + 1000 * uptime;
                if (updated < now) {
                    this.createQueryBuilder().update(entity_1.Store).set({ temporary: 0 }).where('id = :id', { id: row.id }).execute();
                }
            });
            return rows;
        });
    },
    deleteCollection(collectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.createQueryBuilder().delete().where('collection_id = :id', { id: collectionId }).execute();
        });
    },
    resetSystem() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.createQueryBuilder().delete().where('store.system = 1').execute();
        });
    },
    resetFavorites() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.createQueryBuilder().update(entity_1.Store).set({ favorite: 0 }).where('store.favorite = 1').execute();
        });
    },
    fetchCollectionItems(collectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.createQueryBuilder()
                .select('store.id', 'id')
                .where({ collection_id: (0, typeorm_1.Equal)(collectionId) })
                .getRawMany();
        });
    },
    fetchCollectionCount(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.createQueryBuilder().select('COUNT(*)', 'total').where('store.collection_id = :id', { id: id }).getRawOne();
        });
    },
    fetchCollectionsCount() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.createQueryBuilder()
                .select('store.collection_id', 'collection_id')
                .addSelect('COUNT(*)', 'total')
                .groupBy('store.collection_id')
                .getRawMany();
        });
    },
    create(item) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = {};
            data.collection_id = item.collection_id;
            data.file_name = item.file_name ? item.file_name : '';
            data.file_path = item.file_path ? item.file_path : '';
            data.file_size = item.file_size ? item.file_size : 0;
            data.file_size_pretty = item.file_size_pretty ? item.file_size_pretty : '';
            data.file_type = item.file_type ? item.file_type : '';
            data.installable = item.installable ? item.installable : 0;
            data.temporary = item.temporary ? item.temporary : 0;
            data.favorite = item.favorite ? item.favorite : 0;
            data.system = item.system ? item.system : 0;
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
            return yield this.createQueryBuilder().insert().into(entity_1.Store).values(data).execute();
        });
    },
    evaluateSmartRules(rules_1, matchType_1) {
        return __awaiter(this, arguments, void 0, function* (rules, matchType, options = {}) {
            const db = this.createQueryBuilder();
            const textFields = [
                'file_name',
                'file_path',
                'compatible_full_name',
                'copyright',
                'description',
                'designer',
                'designer_url',
                'font_family',
                'font_subfamily',
                'full_name',
                'license',
                'license_url',
                'manufacturer',
                'manufacturer_url',
                'post_script_name',
                'preferred_family',
                'preferred_sub_family',
                'sample_text',
                'trademark',
                'unique_id',
                'version',
            ];
            const booleanFields = ['favorite', 'system', 'installable', 'temporary'];
            const numericFields = ['file_size'];
            const dateFields = ['created'];
            if (rules.length > 0) {
                const conditions = rules.map((rule, idx) => {
                    const field = `store.${rule.field}`;
                    const paramName = `p${idx}`;
                    return (qb) => {
                        if (textFields.includes(rule.field)) {
                            const val = String(rule.value).toLowerCase();
                            switch (rule.operator) {
                                case 'contains':
                                    qb.where(`LOWER(${field}) LIKE :${paramName}`, { [paramName]: `%${val}%` });
                                    break;
                                case 'equals':
                                    qb.where(`LOWER(${field}) = :${paramName}`, { [paramName]: val });
                                    break;
                                case 'starts_with':
                                    qb.where(`LOWER(${field}) LIKE :${paramName}`, { [paramName]: `${val}%` });
                                    break;
                                case 'ends_with':
                                    qb.where(`LOWER(${field}) LIKE :${paramName}`, { [paramName]: `%${val}` });
                                    break;
                                default:
                                    qb.where(`LOWER(${field}) LIKE :${paramName}`, { [paramName]: `%${val}%` });
                            }
                        }
                        else if (rule.field === 'file_type') {
                            qb.where(`${field} = :${paramName}`, { [paramName]: rule.value });
                        }
                        else if (booleanFields.includes(rule.field)) {
                            const boolVal = rule.operator === 'is_not' ? 0 : 1;
                            qb.where(`${field} = :${paramName}`, { [paramName]: boolVal });
                        }
                        else if (numericFields.includes(rule.field)) {
                            if (rule.operator === 'greater_than') {
                                qb.where(`${field} > :${paramName}`, { [paramName]: rule.value });
                            }
                            else if (rule.operator === 'less_than') {
                                qb.where(`${field} < :${paramName}`, { [paramName]: rule.value });
                            }
                            else {
                                qb.where(`${field} = :${paramName}`, { [paramName]: rule.value });
                            }
                        }
                        else if (dateFields.includes(rule.field)) {
                            if (rule.operator === 'greater_than') {
                                qb.where(`${field} >= :${paramName}`, { [paramName]: rule.value });
                            }
                            else if (rule.operator === 'less_than') {
                                qb.where(`${field} <= :${paramName}`, { [paramName]: rule.value });
                            }
                            else {
                                qb.where(`${field} = :${paramName}`, { [paramName]: rule.value });
                            }
                        }
                    };
                });
                const joiner = matchType === 'OR' ? 'orWhere' : 'andWhere';
                conditions.forEach((condition, i) => {
                    if (i === 0) {
                        db.where(new typeorm_1.Brackets(condition));
                    }
                    else {
                        db[joiner](new typeorm_1.Brackets(condition));
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
                const direction = options.order.direction === 'DESC' ? 'DESC' : 'ASC';
                db.orderBy(`store.${options.order.column}`, direction);
            }
            return yield db.getManyAndCount();
        });
    },
    fetchSystemStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = yield this.createQueryBuilder()
                .select('COUNT(*)', 'rowCount')
                .addSelect('SUM(CASE WHEN store.favorite = 1 THEN 1 ELSE 0 END)', 'favoriteCount')
                .addSelect('SUM(CASE WHEN store.system = 1 THEN 1 ELSE 0 END)', 'systemCount')
                .addSelect('SUM(CASE WHEN store.temporary = 1 THEN 1 ELSE 0 END)', 'temporaryCount')
                .getRawOne();
            return {
                rowCount: Number(stats.rowCount) || 0,
                favoriteCount: Number(stats.favoriteCount) || 0,
                systemCount: Number(stats.systemCount) || 0,
                temporaryCount: Number(stats.temporaryCount) || 0,
            };
        });
    },
};
//# sourceMappingURL=Store.repository.js.map