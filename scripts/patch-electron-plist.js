const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const plist = path.join(
  __dirname,
  '..',
  'node_modules',
  'electron',
  'dist',
  'Electron.app',
  'Contents',
  'Info.plist'
);

if (process.platform !== 'darwin' || !fs.existsSync(plist)) {
  process.exit(0);
}

const appName = 'Fontastic';

execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleName ${appName}" "${plist}"`);
execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName ${appName}" "${plist}"`);

console.log(`Patched Electron.app plist with name "${appName}"`);
