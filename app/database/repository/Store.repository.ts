import { Brackets, Equal } from "typeorm";
import { Store } from "../entity";
import { searchDbColumns } from "../../config"

export const StoreRepository = {

  async search(options: any) {
    const db = this.createQueryBuilder();

    if (options.where && options.where.length) {

      const where = options.where;
      const builder = [];

      let isAndWhere = false;

      const hasSearchTerm = where.some((item: any) => item.key === 'term');

      if (hasSearchTerm) {
        const searchTerm = where.find((item: any) => item.key === 'term');
        searchDbColumns.forEach((item: any) => {
          builder.push({
            key: item,
            type: 'like',
            value: searchTerm.value.toLowerCase()
          });
        });
      }

      const hasFileTypes = where.some((item: any) => item.key === 'file_type');

      if (hasFileTypes) {
        const fileTypes = where.find((item: any) => item.key === 'file_type');
        if (fileTypes && fileTypes.value.length) {
          isAndWhere = true;
          db.where(`${fileTypes.key} IN (:...mimes)`, { mimes: fileTypes.value });
        }
      }

      if (isAndWhere) {

        db.andWhere(
          new Brackets((qb) => {
            builder.forEach((item: any, i: any) => {
              const column = item.key;
              const value = item.value;
              if (i === 0) {
                qb.where(`LOWER(${column}) LIKE :placeholder`, { placeholder: `%${value}%` });
              } else {
                qb.orWhere(`LOWER(${column}) LIKE :placeholder`, { placeholder: `%${value}%` });
              }
            });
          }),
        );

      } else {

        builder.forEach((item: any, i: any) => {
          const column = item.key;
          const value = item.value;
          if (i === 0) {
            db.where(`LOWER(${column}) LIKE :placeholder`, { placeholder: `%${value}%` });
          } else {
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

    return await db.getManyAndCount();
  },

  async fetch(options: any) {
    const db = this.createQueryBuilder();

    if (options.ids && options.ids.length) {
      db.where("store.collection_id IN (:...ids)", { ids: options.ids })
    } else if (options.where && options.where.length) {
      options.where.forEach((item: any, i: number) => {
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

    // console.log(db.printSql());
    // console.log(db.getSql());
    // console.log(db.getQuery());

    return await db.getManyAndCount();
  },

  update(id: number, data: any) {
    return this.createQueryBuilder().update(Store)
      .set(data)
      .where("id = :id", { id: id })
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
    const rows = await this.createQueryBuilder().where("store.temporary = 1").getMany();
    const now = new Date().getTime();
    rows.forEach((row: Store) => {
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

  async resetSystem() {
    return await this.createQueryBuilder().delete().where("store.system = 1").execute();
  },

  async resetFavorites() {
    return await this.createQueryBuilder().update(Store).set({ favorite: 0 }).where("store.favorite = 1").execute();
  },

  async resetActivated() {
    return await this.createQueryBuilder().update(Store).set({ activated: 0 }).where("store.activated = 1").execute();
  },

  async syncActivated() {
    const results = await this.createQueryBuilder("store").select(['store.file_name']).where("store.system = 1").getMany();

    const fileNames = results.map((item: Store) => item.file_name);

    return await this.createQueryBuilder()
      .update(Store)
      .set({ activated: 1 })
      .where("store.system = 0")
      .andWhere("store.file_name IN (:...names)", { names: fileNames })
      //.getQuery();
      .execute();
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

    //@todo Log errors in log table.
    return await this.createQueryBuilder().insert().into(Store).values(data).execute().catch((err: any) => console.log('insert-error', err));
  },

  async fetchSystemStats() {
    const rowCount = await this.createQueryBuilder()
      .select("COUNT(*)", "total")
      .getRawOne();

    const activatedCount = await this.createQueryBuilder()
      .select("COUNT(*)", "total")
      .where("store.activated = 1")
      .andWhere("store.system = 0")
      .getRawOne();

    const favoriteCount = await this.createQueryBuilder()
      .select("COUNT(*)", "total")
      .where("store.favorite = 1")
      .getRawOne();

    const systemCount = await this.createQueryBuilder()
      .select("COUNT(*)", "total")
      .where("store.system = 1")
      .getRawOne();

    const temporaryCount = await this.createQueryBuilder()
      .select("COUNT(*)", "total")
      .where("store.temporary = 1")
      .getRawOne();

    return {
      rowCount: rowCount.total,
      activatedCount: activatedCount.total,
      favoriteCount: favoriteCount.total,
      systemCount: systemCount.total,
      temporaryCount: temporaryCount.total
    }
  }
}
