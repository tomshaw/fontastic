"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prompt = exports.execute = void 0;
const child_process_1 = require("child_process");
const sudo = require('sudo-prompt');
const execute = (cmd, options = {}) => {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(cmd, options, (err, stdout, stderr) => {
            if (err) {
                return reject(err);
            }
            return resolve({ stdout, stderr });
        });
    });
};
exports.execute = execute;
const prompt = (cmd, options = {}) => {
    return new Promise((resolve, reject) => {
        sudo.exec(cmd, options, (err, stdout, stderr) => {
            if (err) {
                return reject(err);
            }
            return resolve({ stdout, stderr });
        });
    });
};
exports.prompt = prompt;
//# sourceMappingURL=command.js.map