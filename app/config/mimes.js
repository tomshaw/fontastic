"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installable = exports.mimeTypes = exports.fontMimeTypes = void 0;
exports.fontMimeTypes = [
    {
        type: "font/ttf",
        name: "TrueType",
        description: "TrueType is an outline font standard developed by Apple in the late 1980s as a competitor to Adobe's Type 1 fonts used in PostScript. It has become the most common format for fonts on the classic Mac OS, macOS, and Microsoft Windows operating systems.",
        installable: true
    },
    {
        type: "font/otf",
        name: "OpenType",
        description: "OpenType is a format for scalable computer fonts. It was built on its predecessor TrueType, retaining TrueType's basic structure and adding many intricate data structures for prescribing typographic behavior. OpenType is a registered trademark of Microsoft Corporation.",
        installable: true
    },
    {
        type: "font/woff",
        name: "Web Open Font Format",
        description: "The Web Open Font Format is a font format for use in web pages. WOFF files are OpenType or TrueType fonts, with format-specific compression applied and additional XML metadata added.",
        installable: false
    },
    {
        type: "font/woff2",
        name: "Web Open Font Format 2",
        description: "A WOFF2 file is a web font file created in the WOFF (Web Open Font Format) 2.0 format, an open format used to deliver webpage fonts on the fly. It is saved as a compressed container that supports TrueType (. TTF) and OpenType (. OTF) fonts. WOFF2 files also support font licensing metadata.",
        installable: false
    },
    {
        type: "font/ttc",
        name: "TrueType Collection",
        description: "TrueType Collection (TTC) is an extension of TrueType format that allows combining multiple fonts into a single file, creating substantial space savings for a collection of fonts with many glyphs in common.",
        installable: false
    },
    {
        type: "font/dfont",
        name: "Datafork TrueType",
        description: "Datafork TrueType is a font wrapper used on Apple Macintosh computers running Mac OS X. It is a TrueType suitcase with the resource map in the data fork, rather than the resource fork as had been the case in Mac OS 9.",
        installable: false
    }
];
exports.mimeTypes = exports.fontMimeTypes.map((item) => item.type);
exports.installable = exports.fontMimeTypes.reduce((prev, curr) => {
    if (curr.installable) {
        prev.push(curr.type);
    }
    return prev;
}, []);
//# sourceMappingURL=mimes.js.map