const { execSync } = require('child_process');

console.log('--- 📱 ADB Wireless Auto-Setup ---');

try {
    // 1. Check connected devices
    const devices = execSync('adb devices').toString();
    const lines = devices.split('\n').filter(line => line.trim() !== '' && !line.startsWith('List'));
    
    if (lines.length === 0) {
        throw new Error("Phone cable se connect nahi hai!");
    }

    // 2. Fetch Phone IP from USB
    console.log('1. Fetching Phone IP...');
    const ipInfo = execSync('adb -d shell ip addr show wlan0').toString();
    const ipMatch = ipInfo.match(/inet\s+(\d+\.\d+\.\d+\.\d+)/);
    
    if (!ipMatch || !ipMatch[1]) {
        throw new Error("IP nahi mili. Kya phone Wi-Fi se connected hai?");
    }

    const phoneIp = ipMatch[1];
    console.log(`📍 Phone IP Found: ${phoneIp}`);

    // 3. Enable TCP Mode
    console.log('2. Enabling TCP Mode on Port 5555...');
    execSync('adb -d tcpip 5555');

    // 4. Connect wirelessly with more delay
    console.log(`3. Connecting to ${phoneIp}. Phone screen par 'Allow' check karein...`);
    
    // 5 seconds wait taaki ADB restart ho sake aur aap Allow daba sakein
    setTimeout(() => {
        try {
            const output = execSync(`adb connect ${phoneIp}:5555`).toString();
            console.log(output);
            
            if (output.includes('connected')) {
                // Thoda aur wait reverse karne se pehle
                console.log('⏳ Authorizing... (Wait 2s)');
                
                setTimeout(() => {
                    try {
                        console.log('4. Setting up reverse port (8081)...');
                        execSync(`adb -s ${phoneIp}:5555 reverse tcp:8081 tcp:8081`);
                        
                        console.log('\n✅ SUCCESS! Ab USB cable nikaal sakte hain.');
                        console.log('-------------------------------------------');
                    } catch (e) {
                        console.log('❌ Auth Error: Phone screen par "Always Allow" karke OK dabayein aur script dobara chalayein.');
                    }
                }, 2000);
            }
        } catch (connErr) {
            console.log('❌ Connection failed: ' + connErr.message);
        }
    }, 4000);

} catch (error) {
    console.log(`\n❌ ERROR: ${error.message}`);
}