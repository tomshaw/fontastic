
export const systemFontsPaths = new Map();
systemFontsPaths.set('win', 'C:\\Windows\\fonts');
systemFontsPaths.set('mac', '/Library/Fonts');
systemFontsPaths.set('unix', '/usr/share/fonts');

export const apiUrl = {
  development: 'http://fontmanager.local/api/v1',
  production: 'https://fontmanager.tomshaw.us/api/v1'
}

export const fontTypeScale = [
  { label: 'Minor Second', size: 1.067 },
  { label: 'Major Second', size: 1.125 },
  { label: 'Minor Third', size: 1.200 },
  { label: 'Major Third', size: 1.250 },
  { label: 'Perfect Fourth', size: 1.333 },
  { label: 'Augmented Fourth', size: 1.414 },
  { label: 'Perfect Fifth', size: 1.500 },
  { label: 'Golden Ratio', size: 1.618 }
];

export const fontMeta = [{
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