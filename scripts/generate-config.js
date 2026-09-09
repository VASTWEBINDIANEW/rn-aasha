const fs = require('fs');
const path = require('path');

const clients = require('../clients.json');
const clientName = process.argv[2];
const client = clients.find(c => c.name === clientName);

if (!client) {
  console.error('❌ Client not found:', clientName);
  process.exit(1);
}

// Template padho
const templatePath = path.join(__dirname, '../src/utils/network/urls.template.ts');
let template = fs.readFileSync(templatePath, 'utf8');

// Values replace karo
template = template
  .replace(/{{baseapiurl}}/g, client.baseapiurl)
  .replace(/{{baseWebUrl}}/g, client.baseWebUrl)
  .replace(/{{AppName}}/g, client.AppName)
  .replace(/{{appPackage}}/g, client.appPackage);

// urls.ts generate karo
const outputPath = path.join(__dirname, '../src/utils/network/urls.ts');
fs.writeFileSync(outputPath, template);

console.log(`✅ Config generated for: ${client.AppName}`);
console.log(`   baseapiurl: ${client.baseapiurl}`);
console.log(`   AppName: ${client.AppName}`);