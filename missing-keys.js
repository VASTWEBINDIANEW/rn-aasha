/**
 * check-missing-keys.js
 * Usage: node check-missing-keys.js
 *
 * Saare .ts/.tsx files me translate("key") dhundta hai
 * aur en.json me check karta hai - missing keys ka file path + line number batata hai
 */

const fs = require('fs');
const path = require('path');

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const SRC_DIR    = path.resolve(__dirname, './');
const EN_JSON    = path.resolve(__dirname, 'src/utils/languageUtils/en.json');
const OUTPUT_FILE = path.resolve(__dirname, 'missing-keys-report.txt');

// Scan in karega inhe
const SCAN_EXTENSIONS = ['.ts', '.tsx'];

// In folders ko skip karega
const SKIP_DIRS = ['node_modules', 'android', 'ios', '.git', 'dist', 'build', 'languageUtils', '__tests__', 'coverage'];

// translate() ke patterns
const TRANSLATE_PATTERNS = [
  /translate\(\s*["'`]([^"'`]+)["'`]/g,
  /i18n\.t\(\s*["'`]([^"'`]+)["'`]/g,
  /\bt\(\s*["'`]([^"'`]+)["'`]/g,
];

// ─── SKIP CONFIG ──────────────────────────────────────────────────────────────
// Prefix-based skip: "ChangePassword." likhne se "ChangePassword.Passwords",
// "ChangePassword.OldPass" etc. sab skip honge
const SKIP_KEY_PREFIXES = [
  // 'ChangePassword.',
  // 'ProfileSection.',
];

// Exact key skip karne ke liye
const SKIP_EXACT_KEYS = [
  // 'some_exact_key',
];
// ──────────────────────────────────────────────────────────────────────────────

// Should this key be skipped?
function shouldSkip(key) {
  if (SKIP_EXACT_KEYS.includes(key)) return true;
  for (const prefix of SKIP_KEY_PREFIXES) {
    if (key.startsWith(prefix)) return true;
  }
  return false;
}

// 1. en.json load karo
let enData;
try {
  enData = JSON.parse(fs.readFileSync(EN_JSON, 'utf-8'));
} catch (e) {
  console.error('❌ en.json load nahi hua:', e.message);
  process.exit(1);
}

// 2. Nested key check helper  →  "home.title" → enData.home.title
function keyExists(obj, dotKey) {
  const parts = dotKey.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || typeof current !== 'object' || !(part in current)) {
      return false;
    }
    current = current[part];
  }
  return true;
}

// 3. Recursively saare files collect karo
function getAllFiles(dir, result = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return result;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, result);
    } else if (SCAN_EXTENSIONS.includes(path.extname(entry.name))) {
      result.push(fullPath);
    }
  }
  return result;
}

// 4. Ek file me se keys extract karo (line number ke saath)
function extractKeysFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const found = [];
  lines.forEach((lineText, idx) => {
    for (const pattern of TRANSLATE_PATTERNS) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(lineText)) !== null) {
        const key = match[1].trim();
        if (key.includes('${') || key.includes('+')) continue;
        found.push({ key, line: idx + 1 });
      }
    }
  });
  return found;
}

// 5. Main logic
console.log('🔍 Scanning project...');
console.log(`   SRC: ${SRC_DIR}`);
console.log(`   EN:  ${EN_JSON}\n`);

const allFiles = getAllFiles(SRC_DIR);
console.log(`📁 Total files found: ${allFiles.length}`);

const missingMap = {};
let totalTranslateUsages = 0;
let totalSkipped = 0;
const allKeysSet = new Set();

for (const filePath of allFiles) {
  const keys = extractKeysFromFile(filePath);
  totalTranslateUsages += keys.length;

  for (const { key, line } of keys) {
    // Skip config check
    if (shouldSkip(key)) {
      totalSkipped++;
      continue;
    }

    allKeysSet.add(key);
    if (!keyExists(enData, key)) {
      if (!missingMap[key]) missingMap[key] = [];
      missingMap[key].push({
        filePath: path.relative(SRC_DIR, filePath).replace(/\\/g, '/'),
        line,
      });
    }
  }
}

// 6. Report banao
const missingKeys = Object.keys(missingMap).sort();
const totalMissing = missingKeys.length;

const lines = [];
lines.push('='.repeat(70));
lines.push('  MISSING TRANSLATION KEYS REPORT');
lines.push('='.repeat(70));
lines.push(`  Scan Directory : ${SRC_DIR}`);
lines.push(`  en.json        : ${EN_JSON}`);
lines.push(`  Generated At   : ${new Date().toLocaleString()}`);
lines.push('='.repeat(70));
lines.push(`  Total translate() usages : ${totalTranslateUsages}`);
lines.push(`  Unique keys used         : ${allKeysSet.size}`);
lines.push(`  Skipped (by config)      : ${totalSkipped}`);
lines.push(`  Missing in en.json       : ${totalMissing}`);
lines.push('='.repeat(70));
lines.push('');

if (totalMissing === 0) {
  lines.push('✅ Koi bhi key missing nahi hai! Sab theek hai.');
} else {
  missingKeys.forEach((key, i) => {
    lines.push(`${i + 1}. KEY: "${key}"`);
    missingMap[key].forEach(({ filePath, line }) => {
      lines.push(`     → ${filePath}  (line ${line})`);
    });
    lines.push('');
  });

  lines.push('='.repeat(70));
  lines.push('  QUICK FIX — en.json me ye add karo:');
  lines.push('='.repeat(70));
  lines.push('{');
  missingKeys.forEach((key) => {
    lines.push(`  "${key}": "${key}",`);
  });
  lines.push('}');
}

const report = lines.join('\n');
console.log('\n' + report);
fs.writeFileSync(OUTPUT_FILE, report, 'utf-8');
console.log(`\n📄 Report saved: ${OUTPUT_FILE}`);