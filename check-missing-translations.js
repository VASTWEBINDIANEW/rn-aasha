const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
// 1. Apne en.json ka sahi path yaha set karein
const EN_JSON_PATH = path.join(__dirname, './en.json'); 

// 2. Jin folders ko scan karna hai (jaise src, components, screens)
const FOLDERS_TO_SCAN = [
  path.join(__dirname, './src'), 
  // path.join(__dirname, './components'), // Agar src se bahar hain toh uncomment karein
];

// 3. File extensions jinhe scan karna hai
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
// ---------------------

// en.json file load karein
let enTranslations = {};
try {
  const enContent = fs.readFileSync(EN_JSON_PATH, 'utf8');
  enTranslations = JSON.parse(enContent);
} catch (error) {
  console.error('❌ Error: en.json file nahi mili ya invalid JSON hai!', error.message);
  process.exit(1);
}

// Regex to find translate('...') or i18n.t('...')
// Yeh single quotes, double quotes aur template literals teeno ko match karega
const translateRegex = /\b(?:translate|t)\(\s*['"`]([^'"`]+)['"`]/g;

let totalChecked = 0;
const missingKeysMap = new Map(); // File wise missing keys store karne ke liye

// Helper function: check if key exists in nested object (e.g., "ChangePassword.Current Password")
function hasKey(obj, pathStr) {
  const keys = pathStr.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return false;
    }
    current = current[key];
  }
  return current !== undefined;
}

// Directory recursive scan karne ke liye function
function scanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // node_modules ko ignore karne ke liye
      if (file !== 'node_modules' && file !== '.git') {
        scanDirectory(fullPath);
      }
    } else if (stat.isFile() && EXTENSIONS.includes(path.extname(file))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      let match;
      
      // Reset regex index for safety
      translateRegex.lastIndex = 0;

      while ((match = translateRegex.exec(content)) !== null) {
        const extractedKey = match[1];
        totalChecked++;

        // Agar key en.json me nahi hai
        if (!hasKey(enTranslations, extractedKey)) {
          if (!missingKeysMap.has(fullPath)) {
            missingKeysMap.set(fullPath, new Set());
          }
          missingKeysMap.get(fullPath).add(extractedKey);
        }
      }
    }
  });
}

// Execution Start
console.log('⏳ Project scanning aur missing keys checking shuru ho raha hai...\n');

FOLDERS_TO_SCAN.forEach(folder => {
  scanDirectory(folder);
});

// --- REPORT GENERATION ---
console.log('===================================================');
console.log(`📊 TOTAL TRANSLATION CALLS CHECKED: ${totalChecked}`);
console.log('===================================================\n');

if (missingKeysMap.size === 0) {
  console.log('✅ Sab sahi hai! Koi bhi used key en.json me missing nahi hai.');
} else {
  console.log(`❌ ${missingKeysMap.size} files me missing translation keys mili hain:\n`);
  
  let totalMissing = 0;

  missingKeysMap.forEach((keysSet, filePath) => {
    const relativePath = path.relative(__dirname, filePath);
    console.log(`📁 File: ${relativePath}`);
    
    keysSet.forEach(key => {
      totalMissing++;
      console.log(`   ➔  Line code call: translate('${key}')`);
    });
    console.log(''); // New line for spacing
  });

  console.log('===================================================');
  console.log(`⚠️ Total unique missing keys across all files: ${totalMissing}`);
  console.log('===================================================');
}