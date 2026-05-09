const fs = require('fs');
const path = require('path');

// Yeh script jahan rakhi hai, usi folder ko scan karegi
const LANG_DIR = __dirname; 
const MAX_LENGTH = 40;  // Aap is limit ko change kar sakte hain

const files = ['bn.json', 'en.json', 'gj.json', 'hi.json', 'kn.json', 'mh.json', 'tl.json', 'tn.json'];

function runAnalysis() {
    console.log(`\n🚀 Starting Translation Key Analysis (Threshold: ${MAX_LENGTH} chars)`);
    console.log(`📂 Scanning Folder: ${LANG_DIR}`);
    console.log("------------------------------------------------------------------");

    let totalIssues = 0;

    files.forEach(file => {
        const filePath = path.join(LANG_DIR, file);

        if (!fs.existsSync(filePath)) {
            // Check silent skips
            return;
        }

        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const keys = Object.keys(data);
            const longKeys = keys.filter(k => k.length > MAX_LENGTH);

            if (longKeys.length > 0) {
                console.log(`\n🔴 ${file.toUpperCase()} (${keys.length} total keys)`);
                
                const tableData = longKeys.map(k => ({
                    "Key Preview": k.length > 40 ? k.substring(0, 37) + "..." : k,
                    "Size": k.length
                }));
                
                console.table(tableData);
                totalIssues += longKeys.length;
            }
        } catch (e) {
            console.error(`❌ Error reading ${file}: ${e.message}`);
        }
    });

    console.log("\n------------------------------------------------------------------");
    if (totalIssues > 0) {
        console.log(`⚠️  Analysis complete. Total ${totalIssues} long keys found.`);
    } else {
        console.log("🎉 Everything looks great! No long keys found.");
    }
}

runAnalysis();