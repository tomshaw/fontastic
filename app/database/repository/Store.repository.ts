import { Brackets, Equal } from 'typeorm';
import { Store } from '../entity';
import { searchDbColumns } from '../../config';

export const StoreRepository = {
  async search(options: any) {
    const db = this.createQueryBuilder();

    if (options.where && options.where.length) {
      const where = options.where;
      const andConditions: ((qb: any) => void)[] = [];

      // Search term with optional field restriction
      const hasSearchTerm = where.some((item: any) => item.key === 'term');
      if (hasSearchTerm) {
        const searchTerm = where.find((item: any) => item.key === 'term');
        const searchFieldsEntry = where.find((item: any) => item.key === 'search_fields');
        const columns = searchFieldsEntry && searchFieldsEntry.value.length > 0 ? searchFieldsEntry.value : searchDbColumns;
        const value = searchTerm.value.toLowerCase();

        andConditions.push((qb: any) => {
          columns.forEach((col: string, i: number) => {
            if (i === 0) {
              qb.where(`LOWER(${col}) LIKE :term`, { term: `%${value}%` });
            } else {
              qb.orWhere(`LOWER(${col}) LIKE :term`, { term: `%${value}%` });
            }
          });
        });
      }

      // File type filter
      const hasFileTypes = where.some((item: any) => item.key === 'file_type');
      if (hasFileTypes) {
        const fileTypes = where.find((item: any) => item.key === 'file_type');
        if (fileTypes && fileTypes.value.length) {
          andConditions.push((qb: any) => {
            qb.where(`file_type IN (:...mimes)`, { mimes: fileTypes.value });
          });
        }
      }

      // Status filters
      const favoriteEntry = where.find((item: any) => item.key === 'favorite');
      if (favoriteEntry) {
        andConditions.push((qb: any) => {
          qb.where(`store.favorite = :fav`, { fav: favoriteEntry.value });
        });
      }

      const systemEntry = where.find((item: any) => item.key === 'system');
      if (systemEntry) {
        andConditions.push((qb: any) => {
          qb.where(`store.system = :sys`, { sys: systemEntry.value });
        });
      }

      const installableEntry = where.find((item: any) => item.key === 'installable');
      if (installableEntry) {
        andConditions.push((qb: any) => {
          qb.where(`store.installable = :inst`, { inst: installableEntry.value });
        });
      }

      // Collection filter
      const collectionEntry = where.find((item: any) => item.key === 'collection_id');
      if (collectionEntry) {
        andConditions.push((qb: any) => {
          qb.where(`store.collection_id = :colId`, { colId: collectionEntry.value });
        });
      }

      // Designer text filter
      const designerEntry = where.find((item: any) => item.key === 'designer');
      if (designerEntry) {
        andConditions.push((qb: any) => {
          qb.where(`LOWER(store.designer) LIKE :designer`, { designer: `%${designerEntry.value.toLowerCase()}%` });
        });
      }

      // Manufacturer text filter
      const manufacturerEntry = where.find((item: any) => item.key === 'manufacturer');
      if (manufacturerEntry) {
        andConditions.push((qb: any) => {
          qb.where(`LOWER(store.manufacturer) LIKE :manufacturer`, { manufacturer: `%${manufacturerEntry.value.toLowerCase()}%` });
        });
      }

      // Font subfamily text filter
      const subfamilyEntry = where.find((item: any) => item.key === 'font_subfamily');
      if (subfamilyEntry) {
        andConditions.push((qb: any) => {
          qb.where(`LOWER(store.font_subfamily) LIKE :subfamily`, { subfamily: `%${subfamilyEntry.value.toLowerCase()}%` });
        });
      }

      // File size range
      const fileSizeMin = where.find((item: any) => item.key === 'file_size_min');
      if (fileSizeMin) {
        andConditions.push((qb: any) => {
          qb.where(`store.file_size >= :sizeMin`, { sizeMin: fileSizeMin.value });
        });
      }

      const fileSizeMax = where.find((item: any) => item.key === 'file_size_max');
      if (fileSizeMax) {
        andConditions.push((qb: any) => {
          qb.where(`store.file_size <= :sizeMax`, { sizeMax: fileSizeMax.value });
        });
      }

      // Date range
      const dateFrom = where.find((item: any) => item.key === 'date_from');
      if (dateFrom) {
        andConditions.push((qb: any) => {
          qb.where(`store.created >= :dateFrom`, { dateFrom: dateFrom.value });
        });
      }

      const dateTo = where.find((item: any) => item.key === 'date_to');
      if (dateTo) {
        andConditions.push((qb: any) => {
          qb.where(`store.created <= :dateTo`, { dateTo: dateTo.value + ' 23:59:59' });
        });
      }

      // Apply all conditions with AND logic
      andConditions.forEach((condition, i) => {
        if (i === 0) {
          db.where(new Brackets(condition));
        } else {
          db.andWhere(new Brackets(condition));
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

    return await db.getManyAndCount();
  },

  async fetch(options: any) {
    const db = this.createQueryBuilder();

    if (options.ids && options.ids.length) {
      db.where('store.collection_id IN (:...ids)', { ids: options.ids });
    } else if (options.where && options.where.length) {
      options.where.forEach((item: any, i: number) => {
        let column = item.key;
        let value = item.value;
        if (i === 0) {
          db.where(`${column} = :placeholder`, { placeholder: value });
        } else {
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

    return await db.getManyAndCount();
  },

  update(id: number, data: any) {
    return this.createQueryBuilder().update(Store).set(data).where('id = :id', { id: id }).execute();
  },

  async resetTemporaryFonts(uptime: number) {
    const rows = await this.createQueryBuilder().where('store.temporary = 1').getMany();
    const now = new Date().getTime();
    rows.forEach((row: Store) => {
      let updated = new Date(row.updated).getTime() + 1000 * uptime;
      if (updated < now) {
        this.createQueryBuilder().update(Store).set({ temporary: 0 }).where('id = :id', { id: row.id }).execute();
      }
    });
    return rows;
  },

  async deleteCollection(collectionId: number) {
    return await this.createQueryBuilder().delete().where('collection_id = :id', { id: collectionId }).execute();
  },

  async resetSystem() {
    return await this.createQueryBuilder().delete().where('store.system = 1').execute();
  },

  async resetFavorites() {
    return await this.createQueryBuilder().update(Store).set({ favorite: 0 }).where('store.favorite = 1').execute();
  },

  async fetchCollectionItems(collectionId: number) {
    return await this.createQueryBuilder()
      .select('store.id', 'id')
      .where({ collection_id: Equal(collectionId) })
      .getRawMany();
  },

  async fetchCollectionCount(id: number) {
    return await this.createQueryBuilder().select('COUNT(*)', 'total').where('store.collection_id = :id', { id: id }).getRawOne();
  },

  async fetchCollectionsCount() {
    return await this.createQueryBuilder()
      .select('store.collection_id', 'collection_id')
      .addSelect('COUNT(*)', 'total')
      .groupBy('store.collection_id')
      .getRawMany();
  },

  async create(item: Store) {
    let data = <Store>{};

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

    //@todo Log errors in log table.
    return await this.createQueryBuilder()
      .insert()
      .into(Store)
      .values(data)
      .execute()
      .catch((err: any) => console.log('insert-error', err));
  },

  async fetchSystemStats() {
    const rowCount = await this.createQueryBuilder().select('COUNT(*)', 'total').getRawOne();

    const favoriteCount = await this.createQueryBuilder().select('COUNT(*)', 'total').where('store.favorite = 1').getRawOne();

    const systemCount = await this.createQueryBuilder().select('COUNT(*)', 'total').where('store.system = 1').getRawOne();

    const temporaryCount = await this.createQueryBuilder().select('COUNT(*)', 'total').where('store.temporary = 1').getRawOne();

    return {
      rowCount: rowCount.total,
      favoriteCount: favoriteCount.total,
      systemCount: systemCount.total,
      temporaryCount: temporaryCount.total,
    };
  },
};
