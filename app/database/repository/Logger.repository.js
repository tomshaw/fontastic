"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerRepository = void 0;
const entity_1 = require("../entity");
exports.LoggerRepository = {
    log(data) {
        return this.createQueryBuilder().insert().into(entity_1.Logger).values(data).execute();
    }
};
//# sourceMappingURL=Logger.repository.js.map