"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
const typeorm_1 = require("typeorm");
const Store_schema_1 = require("./Store.schema");
let Collection = class Collection {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Collection.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        length: 100
    }),
    __metadata("design:type", String)
], Collection.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        default: 0
    }),
    __metadata("design:type", Number)
], Collection.prototype, "parent_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "smallint",
        default: 0
    }),
    __metadata("design:type", Number)
], Collection.prototype, "left_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "smallint",
        default: 0
    }),
    __metadata("design:type", Number)
], Collection.prototype, "right_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "smallint",
        default: 0
    }),
    __metadata("design:type", Number)
], Collection.prototype, "count", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "smallint",
        default: 0
    }),
    __metadata("design:type", Number)
], Collection.prototype, "is_system", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "smallint",
        default: 0
    }),
    __metadata("design:type", Number)
], Collection.prototype, "orderby", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "smallint",
        default: 0
    }),
    __metadata("design:type", Boolean)
], Collection.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "smallint",
        default: 0
    }),
    __metadata("design:type", Boolean)
], Collection.prototype, "collapsed", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Collection.prototype, "created", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Collection.prototype, "updated", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Store_schema_1.Store, (store) => store.collection, { cascade: true }),
    __metadata("design:type", Array)
], Collection.prototype, "stores", void 0);
Collection = __decorate([
    (0, typeorm_1.Entity)()
], Collection);
exports.Collection = Collection;
//# sourceMappingURL=Collection.schema.js.map