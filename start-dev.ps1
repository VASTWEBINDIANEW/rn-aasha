# start-dev.ps1
# Purpose: Purane/stray java (Gradle/Kotlin daemon) processes clean karke
#          sirf VS Code aur React Native Metro bundler chalata hai.
#
# Usage: Project folder mein jaake PowerShell mein chalao:
#   .\start-dev.ps1

param(
    [string]$ProjectPath = (Get-Location).Path
)

Write-Host "=== Dev environment cleanup shuru ho raha hai ===" -ForegroundColor Cyan

# 1. Saare stray java processes (Gradle daemon, Kotlin daemon) kill karo
$javaProcesses = Get-Process java -ErrorAction SilentlyContinue
if ($javaProcesses) {
    $count = $javaProcesses.Count
    Write-Host "Mila: $count java process(es) chal rahe the. Kill kar rahe hain..." -ForegroundColor Yellow
    $javaProcesses | Stop-Process -Force
    Start-Sleep -Seconds 2
    Write-Host "Saare purane java processes band kar diye." -ForegroundColor Green
} else {
    Write-Host "Koi stray java process nahi mila. Achha hai." -ForegroundColor Green
}

# 2. Gradle daemon registry bhi properly stop karo (agar android folder hai)
$androidPath = Join-Path $ProjectPath "android"
if (Test-Path $androidPath) {
    Write-Host "Gradle daemon registry clean kar rahe hain..." -ForegroundColor Yellow
    Push-Location $androidPath
    try {
        & .\gradlew.bat --stop 2>$null
    } catch {
        Write-Host "Gradle --stop skip ho gaya (shayad pehle se clean hai)." -ForegroundColor DarkGray
    }
    Pop-Location
}

# 3. Verify karo koi java process bacha toh nahi
Start-Sleep -Seconds 1
$remaining = Get-Process java -ErrorAction SilentlyContinue
if ($remaining) {
    Write-Host "Warning: $($remaining.Count) java process(es) abhi bhi chal rahe hain." -ForegroundColor Red
} else {
    Write-Host "Confirm: Ab koi java process nahi chal raha." -ForegroundColor Green
}

Write-Host ""
Write-Host "=== VS Code aur Metro bundler start kar rahe hain ===" -ForegroundColor Cyan

# 4. VS Code kholo project folder ke saath
Write-Host "VS Code khol rahe hain..." -ForegroundColor Yellow
code $ProjectPath

# 5. Metro bundler naye terminal window mein start karo
#    (Alag window mein taaki ye script khud block na ho)
Write-Host "Metro bundler (React Native) start kar rahe hain naye window mein..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectPath'; yarn start" -WorkingDirectory $ProjectPath

Write-Host ""
Write-Host "=== Sab set! VS Code aur Metro chal rahe hain, background mein koi extra java process nahi. ===" -ForegroundColor Green
Write-Host "Jab bhi Android build chalani ho, tab hi naya Gradle daemon spawn hoga — normal hai." -ForegroundColor DarkGray
