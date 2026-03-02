/**
 * @see https://typeorm.io/logging
 * @see https://github.com/typeorm/typeorm/issues/390
 */

export const database = {
  drivers: [
    "sqlite", 
    "mysql", 
    "sqlserver", 
    "oracle", 
    "hana", 
    "sqljs"
  ],
  connections: [{
    name: "default",
    type: "sqlite",
    title: "Default Database.",
    description: "The default application database.",
    enabled: true,
    synchronize: true,
    database: "fontastic.sqlite",
    charset: "utf8mb4_unicode_ci",
    logger: "simple-console",
    logging: false
  }, {
    name: "mysql",
    type: "mysql",
    title: "Development Database.",
    description: "An example MySQL database.",
    enabled: false,
    host: "localhost",
    port: 3306,
    username: "root",
    password: "password",
    database: "project_fontastic",
    charset: "utf8mb4_unicode_ci",
    synchronize: true,
    logger: "simple-console",
    logging: false
  }],
  loggers: [
    {
      title: "Simple Console",
      value: "simple-console"
    },
    {
      title: "Advanced Console",
      value: "advanced-console"
    },
    {
      title: "File Logging",
      value: "file"
    },
    {
      title: "Debug Logging",
      value: "debug"
    }
  ]
}

export const dbColumns = [
  {
    name: 'id',
    searchable: false,
  },
  {
    name: 'collection_id',
    searchable: false,
  },
  {
    name: 'file_name',
    searchable: true,
  },
  {
    name: 'file_path',
    searchable: true,
  },
  {
    name: 'file_size',
    searchable: false,
  },
  {
    name: 'file_size_pretty',
    searchable: false,
  },
  {
    name: 'file_type',
    searchable: false,
  },
  {
    name: 'installable',
    searchable: false,
  },
  {
    name: 'activated',
    searchable: false,
  },
  {
    name: 'temporary',
    searchable: false,
  },
  {
    name: 'favorite',
    searchable: false,
  },
  {
    name: 'system',
    searchable: false,
  },
  {
    name: 'compatible_full_name',
    searchable: true,
  },
  {
    name: 'copyright',
    searchable: true,
  },
  {
    name: 'description',
    searchable: true,
  },
  {
    name: 'designer',
    searchable: true,
  },
  {
    name: 'designer_url',
    searchable: true,
  },
  {
    name: 'font_family',
    searchable: true,
  },
  {
    name: 'font_subfamily',
    searchable: true,
  },
  {
    name: 'full_name',
    searchable: true,
  },
  {
    name: 'license',
    searchable: true,
  },
  {
    name: 'license_url',
    searchable: true,
  },
  {
    name: 'manufacturer',
    searchable: true,
  },
  {
    name: 'manufacturer',
    searchable: true,
  },
  {
    name: 'post_script_name',
    searchable: true,
  },
  {
    name: 'preferred_family',
    searchable: true,
  },
  {
    name: 'preferred_sub_family',
    searchable: true,
  },
  {
    name: 'sample_text',
    searchable: true,
  },
  {
    name: 'trademark',
    searchable: true,
  },
  {
    name: 'unique_id',
    searchable: true,
  },
  {
    name: 'version',
    searchable: true,
  },
  {
    name: 'created_at',
    searchable: false,
  },
  {
    name: 'updated_at',
    searchable: false,
  }
];

export const searchDbColumns: any[] = dbColumns.reduce((prev, curr) => {
  if (curr.searchable) {
    prev.push(curr.name);
  }
  return prev;
}, []);
