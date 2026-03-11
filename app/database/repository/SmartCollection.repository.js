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
exports.SmartCollectionRepository = void 0;
const entity_1 = require("../entity");
exports.SmartCollectionRepository = {
    fetchAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.createQueryBuilder('sc')
                .orderBy('sc.orderby', 'ASC')
                .addOrderBy('LOWER(sc.title)', 'ASC')
                .getMany();
        });
    },
    createSmartCollection(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createQueryBuilder()
                .insert()
                .into(entity_1.SmartCollection)
                .values({
                title: args.title,
                rules: args.rules,
                match_type: args.match_type,
            })
                .execute();
            return this.fetchAll();
        });
    },
    updateSmartCollection(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createQueryBuilder()
                .update(entity_1.SmartCollection)
                .set(data)
                .where('id = :id', { id })
                .execute();
            return this.fetchAll();
        });
    },
    deleteSmartCollection(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createQueryBuilder()
                .delete()
                .from(entity_1.SmartCollection)
                .where('id = :id', { id })
                .execute();
            return this.fetchAll();
        });
    },
};
//# sourceMappingURL=SmartCollection.repository.js.map