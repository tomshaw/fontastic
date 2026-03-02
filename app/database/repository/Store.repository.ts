import { Equal } from "typeorm";
import { Store } from "../entity";

export const StoreRepository = {

  async fetchStore(options: any) {

    const db = this.createQueryBuilder();

    if (options.where && options.where.length) {
      options.where.forEach((item: any, i: any) => {
        let column = item.key;
        let value = item.value;
        if (i === 0) {
          db.where(`${column} = :placeholder`, { placeholder: value })
        } else {
          db.andWhere(`${column} = :placeholder`, { placeholder: value })
        }
      })
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

    return await db.getManyAndCount();
  },

  updateStore(_data: any) {
    return this.createQueryBuilder().update(Store)
      .set(_data.data)
      .where("id = :id", { id: _data.id })
      .execute();
  },

  activateByIds(ids: any[], activated: number) {
    return this.createQueryBuilder().update(Store)
      .set({ activated: activated })
      .where("id IN (:...ids)", { ids: ids })
      .execute();
  },

  temporaryByIds(ids: any[], activated: number) {
    return this.createQueryBuilder().update(Store)
      .set({ temporary: activated })
      .where("id IN (:...ids)", { ids: ids })
      .execute();
  },

  activateCollection(collectionId: number, activated: number) {
    return this.createQueryBuilder().update(Store)
      .set({ activated: activated })
      .where("collection_id = :id", { id: collectionId })
      .execute();
  },

  temporaryCollection(collectionId: number, activated: number) {
    return this.createQueryBuilder().update(Store)
      .set({ temporary: activated })
      .where("collection_id = :id", { id: collectionId })
      .execute();
  },

  async resetTemporaryFonts(uptime: number) {
    let rows = await this.createQueryBuilder().where("store.temporary = 1").getMany();
    let now = new Date().getTime();
    rows.forEach((row: any) => {
      let updated = new Date(row.updated).getTime() + (1000 * uptime);
      if (updated < now) {
        this.createQueryBuilder().update(Store).set({ temporary: 0 }).where("id = :id", { id: row.id }).execute();
      }
    });
    return rows;
  },

  async deleteCollection(collectionId: number) {
    return await this.createQueryBuilder().delete().where("collection_id = :id", { id: collectionId }).execute();
  },

  async resetSystemFonts() {
    return await this.createQueryBuilder().delete().where("store.system = 1").execute();
  },

  async resetFavorites() {
    return await this.createQueryBuilder().update(Store).set({ favorite: 0 }).where("store.favorite = 1").execute();
  },

  async resetActivated() {
    return await this.createQueryBuilder().update(Store).set({ activated: 0 }).where("store.activated = 1").execute();
  },

  async fetchCollectionItems(collectionId: number) {
    return await this.createQueryBuilder()
      .select("store.id", "id")
      .where({ collection_id: Equal(collectionId) })
      .getRawMany();
  },

  async fetchCollectionCount(id: number) {
    return await this.createQueryBuilder()
      .select("COUNT(*)", "total")
      .where("store.collection_id = :id", { id: id })
      .getRawOne();
  },

  async fetchCollectionsCount() {
    return await this.createQueryBuilder()
      .select("store.collection_id", "collection_id")
      .addSelect("COUNT(*)", "total")
      .groupBy("store.collection_id")
      .getRawMany();
  },

  async create(item: Store) {

    let data = <Store>{};
    
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

    return await this.createQueryBuilder().insert().into(Store).values(data).execute();
  },

  async fetchSystemStats() {

    let rowCount = await this.createQueryBuilder()
      .select("COUNT(*)", "total")
      .getRawOne();

    let activatedCount = await this.createQueryBuilder()
      .select("COUNT(*)", "total")
      .where("store.activated = 1")
      .getRawOne();

    let favoriteCount = await this.createQueryBuilder()
      .select("COUNT(*)", "total")
      .where("store.favorite = 1")
      .getRawOne();

    let systemCount = await this.createQueryBuilder()
      .select("COUNT(*)", "total")
      .where("store.system = 1")
      .getRawOne();

    let temporaryCount = await this.createQueryBuilder()
      .select("COUNT(*)", "total")
      .where("store.temporary = 1")
      .getRawOne();

    return {
      rowCount, activatedCount, favoriteCount, systemCount, temporaryCount
    }
  }
}
