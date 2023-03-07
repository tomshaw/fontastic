"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_log_1 = require("electron-log");
class AppLogger {
    constructor(logName) {
        this.logger = electron_log_1.default.initialize();
        this.logger.transports.file.level = 'debug';
        this.logger.transports.file.fileName = logName + '.log';
        this.logger.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}';
    }
    static getInstance(name = 'default') {
        if (!this._instance) {
            this._instance = new AppLogger(name);
        }
        return this._instance;
    }
    info(message) {
        this.logger.info(message);
    }
    error(e) {
        this.logger.error(e);
    }
    warn(message) {
        this.logger.warn(message);
    }
    debug(message) {
        this.logger.debug(message);
    }
}
exports.default = AppLogger;
//# sourceMappingURL=AppLogger.js.map