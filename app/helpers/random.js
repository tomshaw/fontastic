"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randNumber = exports.randString = void 0;
function randString(len = 7) {
    const list = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
    let res = "";
    for (let i = 0; i < len; i++) {
        let rnd = Math.floor(Math.random() * list.length);
        res = res + list.charAt(rnd);
    }
    return res;
}
exports.randString = randString;
const randNumber = (n) => [...Array(n)].map(_ => Math.random() * 10 | 0).join('');
exports.randNumber = randNumber;
//# sourceMappingURL=random.js.map