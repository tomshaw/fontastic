const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

if (process.platform !== 'darwin') {
  process.exit(0);
}

const electronAppDir = path.join(
  __dirname,
  '..',
  'node_modules',
  'electron',
  'dist',
  'Electron.app'
);

const plist = path.join(electronAppDir, 'Contents', 'Info.plist');

if (!fs.existsSync(plist)) {
  process.exit(0);
}

const pkg = require(path.join(__dirname, '..', 'package.json'));
const appName = 'Fontastic';
const appVersion = pkg.version;

execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleName ${appName}" "${plist}"`);
execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName ${appName}" "${plist}"`);
execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString ${appVersion}" "${plist}"`);

// Copy app icon into the Electron.app bundle
const srcIcon = path.join(__dirname, '..', 'src', 'assets', 'icons', 'favicon.icns');
const destIcon = path.join(electronAppDir, 'Contents', 'Resources', 'electron.icns');

if (fs.existsSync(srcIcon)) {
  fs.copyFileSync(srcIcon, destIcon);
  console.log('Copied app icon into Electron.app bundle');
}

console.log(`Patched Electron.app plist: name="${appName}", version="${appVersion}"`);
