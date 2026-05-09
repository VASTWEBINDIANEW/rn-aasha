const fs = require("fs");
const path = require("path");

const LANG_DIR = __dirname;
const SRC_DIR = path.join(__dirname, "../../");

const languages = [
  "en.json",
  "hi.json",
  "bn.json",
  "gj.json",
  "kn.json",
  "mh.json",
  "tl.json",
  "tn.json"
];

function read(file) {
  return JSON.parse(fs.readFileSync(path.join(LANG_DIR, file), "utf8"));
}

function write(file, data) {
  fs.writeFileSync(
    path.join(LANG_DIR, file),
    JSON.stringify(data, null, 2)
  );
}

function generateKey(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 35);
}

function addMissingKeys() {
  const en = read("en.json");

  const keys = Object.keys(en);

  languages.forEach(file => {
    if (file === "en.json") return;

    const data = read(file);

    let changed = false;

    keys.forEach(key => {
      if (!data[key]) {
        data[key] = en[key];
        changed = true;
      }
    });

    if (changed) {
      write(file, data);
      console.log("✔ Missing keys added →", file);
    }
  });
}

function scanFiles(dir, list = []) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);

    if (fs.statSync(full).isDirectory()) {
      scanFiles(full, list);
    } else if (/\.(js|ts|tsx)$/.test(file)) {
      list.push(full);
    }
  });

  return list;
}

function detectHardcodedText() {
  const en = read("en.json");

  const files = scanFiles(SRC_DIR);

  files.forEach(file => {
    let content = fs.readFileSync(file, "utf8");

    const regex = /"([A-Za-z][^"]{4,})"/g;

    let match;

    while ((match = regex.exec(content)) !== null) {
      const text = match[1];

      if (Object.values(en).includes(text)) continue;

      const key = generateKey(text);

      en[key] = text;

      content = content.replace(
        `"${text}"`,
        `translate('${key}')`
      );

      console.log("⚡ Key created:", key);
    }

    fs.writeFileSync(file, content);
  });

  write("en.json", en);
}

function run() {
  console.log("🚀 Language Tool Running\n");

  addMissingKeys();

  detectHardcodedText();

  console.log("\n🎉 Language system optimized");
}

run();