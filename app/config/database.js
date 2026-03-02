"use strict";
/**
 * @see https://typeorm.io/logging
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = void 0;
exports.database = {
    connectionTypes: [
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
            description: "The default system database.",
            enabled: true,
            synchronize: true,
            database: "fontastic.sqlite",
            logger: "simple-console",
            logging: true
        }, {
            name: "mysql",
            type: "mysql",
            title: "Development Database.",
            description: "A MySQL database used for testing.",
            enabled: false,
            host: "localhost",
            port: 3306,
            username: "root",
            password: "password",
            database: "project_fontastic",
            synchronize: true,
            logger: "simple-console",
            logging: true
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
};
//# sourceMappingURL=database.js.map