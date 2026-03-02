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
exports.Store = void 0;
const typeorm_1 = require("typeorm");
const Collection_schema_1 = require("./Collection.schema");
let Store = class Store {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Store.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("int"),
    __metadata("design:type", Number)
], Store.prototype, "collection_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, default: "", nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "file_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "file_path", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0, nullable: true }),
    __metadata("design:type", Number)
], Store.prototype, "file_size", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "file_size_pretty", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "file_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "smallint", default: 0, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], Store.prototype, "installable", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "smallint", default: 0, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], Store.prototype, "activated", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "smallint", default: 0, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], Store.prototype, "temporary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "smallint", default: 0, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], Store.prototype, "favorite", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "smallint", default: 0, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], Store.prototype, "system", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "compatible_full_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "copyright", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "designer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "designer_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "font_family", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "font_subfamily", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "full_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "license", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "license_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "manufacturer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "manufacturer_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "post_script_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "preferred_family", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "preferred_sub_family", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "sample_text", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "trademark", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "unique_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Store.prototype, "created", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Store.prototype, "updated", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Collection_schema_1.Collection, (model) => model.stores, {
        onDelete: 'CASCADE'
    }),
    (0, typeorm_1.JoinColumn)({ name: "collection_id" }),
    __metadata("design:type", Collection_schema_1.Collection)
], Store.prototype, "collection", void 0);
Store = __decorate([
    (0, typeorm_1.Entity)()
], Store);
exports.Store = Store;
//# sourceMappingURL=Store.schema.js.map