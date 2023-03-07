"use strict";
// SYSTEM SETTINGS
Object.defineProperty(exports, "__esModule", { value: true });
exports.fontTypeScale = exports.importUserOptions = exports.namesTableRecords = exports.fontTableData = exports.systemFontPaths = void 0;
exports.systemFontPaths = new Map();
exports.systemFontPaths.set('win', ['C:\\Windows\\fonts']);
exports.systemFontPaths.set('mac', ['/Library/Fonts']);
exports.systemFontPaths.set('unix', ['/usr/share/fonts', '/usr/local/share/fonts', '~/.local/share/fonts', '~/.fonts']);
exports.fontTableData = [{
        name: 'avar',
        title: 'Axis Variations',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/avar'
    }, {
        name: 'BASE',
        title: 'Baseline',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/base'
    }, {
        name: 'CBDT',
        title: 'Color Bitmap Data',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/cbdt'
    }, {
        name: 'CBLC',
        title: 'Color Bitmap Location',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/cblc'
    }, {
        name: 'CFF',
        title: 'Compact Font Format',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/cff'
    }, {
        name: 'CFF2',
        title: 'Compact Font Format (CFF) Version 2',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/cff2'
    }, {
        name: 'cmap',
        title: 'Character to Glyph Index Mapping',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/cmap'
    }, {
        name: 'COLR',
        title: 'Color',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/colr'
    }, {
        name: 'CPAL',
        title: 'Color Palette',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/cpal'
    }, {
        name: 'cvar',
        title: 'CVT Variations',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/cvar'
    }, {
        name: 'cvt',
        title: 'Control Value',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/cvt'
    }, {
        name: 'DSIG',
        title: 'Digital Signature',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/dsig'
    }, {
        name: 'EBDT',
        title: 'Embedded Bitmap Data',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/ebdt'
    }, {
        name: 'EBLC',
        title: 'Embedded Bitmap Location',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/eblc'
    }, {
        name: 'EBSC',
        title: 'Embedded Bitmap Scaling',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/ebsc'
    }, {
        name: 'fpgm',
        title: 'Font Program',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/fpgm'
    }, {
        name: 'fvar',
        title: 'Font Variations',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/fvar'
    }, {
        name: 'gasp',
        title: 'Grid-fitting and Scan-conversion Procedure',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/gasp'
    }, {
        name: 'GDEF',
        title: 'Glyph Definition',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/gdef'
    }, {
        name: 'glyf',
        title: 'Glyph Data',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/glyf'
    }, {
        name: 'GPOS',
        title: 'Glyph Positioning',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/gpos'
    }, {
        name: 'GSUB',
        title: 'Glyph Substitution',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/gsub'
    }, {
        name: 'gvar',
        title: 'Glyph Variations',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/gvar'
    }, {
        name: 'hdmx',
        title: 'Horizontal Device Metrics',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/hdmx'
    }, {
        name: 'head',
        title: 'Font Header',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/head'
    }, {
        name: 'hhea',
        title: 'Horizontal Header',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/hhea'
    }, {
        name: 'hmtx',
        title: 'Horizontal Metrics',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/htmx'
    }, {
        name: 'HVAR',
        title: 'Horizontal Metrics Variations',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/hvar'
    }, {
        name: 'JSTF',
        title: 'Justification',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/jstf'
    }, {
        name: 'kern',
        title: 'Kerning',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/kern'
    }, {
        name: 'loca',
        title: 'Index to Location',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/loca'
    }, {
        name: 'LTSH',
        title: 'Linear Threshold',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/ltsh'
    }, {
        name: 'MATH',
        title: 'The Mathematical Typesetting',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/math'
    }, {
        name: 'maxp',
        title: 'Maximum Profile',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/maxp'
    }, {
        name: 'MERG',
        title: 'Merge',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/merg'
    }, {
        name: 'meta',
        title: 'Metadata',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/meta'
    }, {
        name: 'MVAR',
        title: 'Metrics Variations',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/mvar'
    }, {
        name: 'name',
        title: 'Naming',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/name'
    }, {
        name: 'OS2',
        title: 'OS/2 and Windows Metrics',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/os2'
    }, {
        name: 'PCLT',
        title: 'PCL 5',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/pclt'
    }, {
        name: 'post',
        title: 'PostScript',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/post'
    }, {
        name: 'prep',
        title: 'Control Value Program',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/prep'
    }, {
        name: 'sbix',
        title: 'Standard Bitmap Graphics',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/sbix'
    }, {
        name: 'STAT',
        title: 'Style Attributes',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/stat'
    }, {
        name: 'SVG',
        title: 'The SVG (Scalable Vector Graphics)',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/svg'
    }, {
        name: 'VDMX',
        title: 'Vertical Device Metrics',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/vdmx'
    }, {
        name: 'vhea',
        title: 'Vertical Header',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/vhea'
    }, {
        name: 'vtmx',
        title: 'Vertical Metrics',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/vtmx'
    }, {
        name: 'VORG',
        title: 'Vertical Origin',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/vorg'
    }, {
        name: 'VVAR',
        title: 'Vertical Metrics Variations',
        required: false,
        url: 'https://learn.microsoft.com/en-us/typography/opentype/spec/vvar'
    }];
exports.namesTableRecords = [{
        code: 0,
        key: 'copyright',
        name: 'Copyright Information',
        description: 'Copyright notice.',
        order: 17
    }, {
        code: 1,
        key: 'fontFamily',
        name: 'Font Family',
        description: 'The font family name.',
        order: 1,
    }, {
        code: 2,
        key: 'fontSubfamily',
        name: 'Font Subfamily',
        description: 'The Font Subfamily name.',
        order: 3,
    }, {
        code: 3,
        key: 'uniqueID',
        name: 'Unique Identifier',
        description: 'Unique font identifier',
        order: 15,
    }, {
        code: 4,
        key: 'fullName',
        name: 'Full Name',
        description: 'Full font name reflects entire family name.',
        order: 2,
    }, {
        code: 5,
        key: 'version',
        name: 'Version',
        description: 'Version string.',
        order: 4,
    }, {
        code: 6,
        key: 'postScriptName',
        name: 'Post Script Name',
        description: 'PostScript name',
        order: 11,
    }, {
        code: 7,
        key: 'trademark',
        name: 'Trademark',
        description: 'Trademark notice information for font.',
        order: 16,
    }, {
        code: 8,
        key: 'manufacturer',
        name: 'Manufacturer',
        description: 'Name of the manufacturer of the typeface.',
        order: 6,
    }, {
        code: 9,
        key: 'designer',
        name: 'Designer',
        description: 'Name of the designer of the typeface.',
        order: 7,
    }, {
        code: 10,
        key: 'description',
        name: 'Description',
        description: 'Description of the typeface.',
        order: 5,
    }, {
        code: 11,
        key: 'vendorURL',
        name: 'Vendor URL',
        description: 'URL of font vendor ',
        order: 18,
    }, {
        code: 12,
        key: 'designerURL',
        name: 'Designer URL',
        description: 'URL of typeface designer',
        order: 19,
    }, {
        code: 13,
        key: 'licenseDescription',
        name: 'License Description',
        description: 'Description of how the font may be legally used',
        order: 20,
    }, {
        code: 14,
        key: 'licenseURL',
        name: 'License URL',
        description: 'URL where additional licensing information can be found.',
        order: 21,
    }, {
        code: 15,
        key: 'reserved',
        name: 'Reserved',
        description: 'Reserved.',
        order: 22,
    }, {
        code: 16,
        key: 'preferredFamily',
        name: 'Preferred Family',
        description: 'Preferred Family',
        order: 8,
    }, {
        code: 17,
        key: 'preferredSubfamily',
        name: 'Preferred Subfamily',
        description: 'Preferred Subfamily',
        order: 9,
    }, {
        code: 18,
        key: 'compatibleFullName',
        name: 'Compatible Full Name',
        description: 'Compatible full name for Macintosh only.',
        order: 10,
    }, {
        code: 19,
        key: 'sampleText',
        name: 'Sample Text',
        description: 'Sample text.',
        order: 23,
    }, {
        code: 20,
        key: 'postscriptCID',
        name: 'Postscript CID',
        description: 'PostScript CID findfont name.',
        order: 12,
    }, {
        code: 21,
        key: 'wwsFamily',
        name: 'WWS Family',
        description: 'WWS family name in case entries do not conform to the WWS model',
        order: 13,
    }, {
        code: 22,
        key: 'wwsSubfamily',
        name: 'WWS Subfamily',
        description: 'WWS subfamily name provides a WWS-conformant subfamily name',
        order: 14,
    }, {
        code: 23,
        key: 'designerName',
        name: 'lightBackgroundPalette',
        description: 'Specifies color palette when displaying on a light background.',
        order: 24,
    }, {
        code: 24,
        key: 'darkBackgroundPalette',
        name: 'Dark Background Palette',
        description: 'Specifies color palette when displaying on a dark background.',
        order: 25,
    }, {
        code: 25,
        key: 'variations',
        name: 'Variations Postscript Name Prefix',
        description: 'Variations PostScript Name Prefix',
        order: 26,
    }];
exports.importUserOptions = [{
        key: 'inplace',
        title: 'Import fonts in place.'
    }, {
        key: 'catalog',
        title: 'Import fonts to catalog.'
    }, {
        key: 'ask',
        title: 'Ask when importing.'
    }];
exports.fontTypeScale = [
    {
        size: 1.067,
        label: 'Minor Second'
    },
    {
        size: 1.125,
        label: 'Major Second'
    },
    {
        size: 1.200,
        label: 'Minor Third'
    },
    {
        size: 1.250,
        label: 'Major Third'
    },
    {
        size: 1.333,
        label: 'Perfect Fourth'
    },
    {
        size: 1.414,
        label: 'Augmented Fourth'
    },
    {
        size: 1.500,
        label: 'Perfect Fifth'
    },
    {
        size: 1.618,
        label: 'Golden Ratio'
    },
    {
        size: 1.600,
        label: 'Minor Sixth'
    },
    {
        size: 1.667,
        label: 'Major Sixth'
    },
    {
        size: 1.778,
        label: 'Minor Seventh'
    },
    {
        size: 1.875,
        label: 'Major Seventh'
    },
    {
        size: 2.000,
        label: 'Octave'
    },
    {
        size: 2.500,
        label: 'Major Tenth'
    },
    {
        size: 2.667,
        label: 'Major Eleventh'
    },
    {
        size: 3.000,
        label: 'Major Twelfth'
    },
    {
        size: 4.000,
        label: 'Double Octave'
    }
];
//# sourceMappingURL=system.js.map