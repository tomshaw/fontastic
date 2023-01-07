// SYSTEM SETTINGS

export const systemFontPaths = new Map();
systemFontPaths.set('win', ['C:\\Windows\\fonts']);
systemFontPaths.set('mac', ['/Library/Fonts']);
systemFontPaths.set('unix', ['/usr/share/fonts', '/usr/local/share/fonts', '~/.local/share/fonts', '~/.fonts']);

export const fontTableData = [{
  code: 0,
  name: 'Copyright Information',
  description: 'Copyright notice.'
}, {
  code: 1,
  name: 'Font Family Name',
  description: 'Font Family name. The Font Family name is used in combination with Font Subfamily name (name ID 2), and should be shared among at most four fonts that differ only in weight or style'
}, {
  code: 2,
  name: 'Font Subfamily Name',
  description: ''
}, {
  code: 3,
  name: 'Unique Identifier',
  description: ''
}, {
  code: 4,
  name: 'Full Font Name',
  description: ''
}, {
  code: 5,
  name: 'Font Version',
  description: ''
}, {
  code: 6,
  name: 'Post Script Name',
  description: ''
}, {
  code: 7,
  name: 'Trademark',
  description: ''
}, {
  code: 8,
  name: 'Manufacturer Name',
  description: ''
}, {
  code: 9,
  name: 'Designer Name',
  description: ''
}, {
  code: 10,
  name: 'Font Description',
  description: ''
}, {
  code: 11,
  name: 'Vendor Url',
  description: ''
}, {
  code: 12,
  name: 'Designer Url',
  description: ''
}, {
  code: 13,
  name: 'License Description',
  description: ''
}, {
  code: 14,
  name: 'License Information',
  description: ''
}, {
  code: 15,
  name: 'Reserved',
  description: ''
}, {
  code: 16,
  name: 'Typographic Family Name',
  description: ''
}, {
  code: 17,
  name: 'Typographic Subfamily Name',
  description: ''
}, {
  code: 18,
  name: 'Compatible Full Name',
  description: ''
}, {
  code: 19,
  name: 'Sample Text',
  description: ''
}, {
  code: 20,
  name: 'Postscript CID',
  description: ''
}, {
  code: 21,
  name: 'WWS Family Name',
  description: ''
}, {
  code: 22,
  name: 'WWS Subfamily Name',
  description: ''
}, {
  code: 23,
  name: 'Light Background Palette',
  description: ''
}, {
  code: 24,
  name: 'Dark Background Palette',
  description: ''
}, {
  code: 25,
  name: 'Variations Postscript Name Prefix',
  description: ''
}];

export const importUserOptions = [{
  key: 'inplace',
  title: 'Import fonts in place.'
}, {
  key: 'catalog',
  title: 'Import fonts to catalog.'
}, {
  key: 'ask',
  title: 'Always ask when importing.'
}];

export const waterfallFontScale = [
  {
    size: 1.067,
    title: 'Minor Second'
  },
  {
    size: 1.125,
    title: 'Major Second'
  },
  {
    size: 1.200,
    title: 'Minor Third'
  },
  {
    size: 1.250,
    title: 'Major Third'
  },
  {
    size: 1.333,
    title: 'Perfect Fourth'
  },
  {
    size: 1.414,
    title: 'Augmented Fourth'
  },
  {
    size: 1.500,
    title: 'Perfect Fifth'
  },
  {
    size: 1.618,
    title: 'Golden Ratio'
  }
];
