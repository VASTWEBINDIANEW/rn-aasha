const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const zipalign = `C:\\Users\\${process.env.USERNAME}\\AppData\\Local\\Android\\Sdk\\build-tools\\35.0.0\\zipalign.exe`;

console.log('zipalign path:', zipalign);
console.log('exists:', fs.existsSync(zipalign));

if (!fs.existsSync(zipalign)) {
  console.log('zipalign not found! Skipping...');
  process.exit(0);
}

function findFiles(dir, filename, results = []) {
  if (!fs.existsSync(dir)) return results;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) findFiles(fullPath, filename, results);
      else if (item === filename) results.push(fullPath);
    } catch (e) {}
  }
  return results;
}

const targetFiles = [
  ...findFiles('node_modules/react-native-reanimated', 'libreanimated.so'),
  ...findFiles('node_modules/react-native-reanimated', 'libworklets.so'),
];

console.log(`\nFound ${targetFiles.length} files\n`);

targetFiles.forEach(lib => {
  console.log('Aligning: ' + lib);
  try {
    execSync(`"${zipalign}" -f -p 16 "${lib}" "${lib}.aligned"`);
    fs.renameSync(lib + '.aligned', lib);
    console.log('✅ Done\n');
  } catch (e) {
    console.log('❌ Failed: ' + e.message + '\n');
  }
});

console.log('All done!');