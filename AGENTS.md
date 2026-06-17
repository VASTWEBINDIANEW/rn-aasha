# AGENTS.md

## Cursor Cloud specific instructions

This repository is a single **React Native 0.77.1** mobile app (`star2alldigital`, branded "Ssv Cms / payon4u"). It is Android-focused (active branch `android-team`); the app talks to remote, already-hosted backends (`http://native.payon4u.com`, `http://native.ssvcms.in`) and Firebase, so there is **no local backend/database to start**. Package manager is **Yarn (classic, v1)**; Node ≥18.

### Environment already provisioned (persists in the VM snapshot)
- **Android SDK** at `~/android-sdk` (cmdline-tools, platform-tools, `platforms;android-35`, `build-tools;35.0.0`, `ndk;27.2.12479018`, `cmake;3.22.1`, emulator + `system-images;android-35;google_apis;x86_64`).
- `ANDROID_HOME` / `ANDROID_SDK_ROOT` / `PATH` are exported from `~/.bashrc`. New non-login shells may not source it — if `adb`/`sdkmanager` is not found, run `source ~/.bashrc` or set `export ANDROID_HOME=$HOME/android-sdk`.
- `android/local.properties` (gitignored) points Gradle at the SDK; the update script recreates it.
- Private Maven credentials for the CredoPay SDK are committed in `android/gradle.properties` (`MAVEN_USERNAME`/`MAVEN_PASSWORD`), so the native build resolves without extra secrets.

### Run / build / test commands
- **Metro dev server**: `yarn start` (port 8081). Verify with `curl -s http://localhost:8081/status` (`packager-status:running`). Fetching `http://localhost:8081/index.bundle?platform=android&dev=true` returns the full app JS bundle (~28 MB, takes ~40s the first time).
- **Android debug build**: `cd android && ./gradlew assembleDebug` → `android/app/build/outputs/apk/debug/app-debug.apk` (~88 MB, ~8 min). If `gradlew` is not executable, run `bash gradlew assembleDebug`.
- **Release JS/OTA bundle**: `yarn bundle:android` (the `bundle:zip`/`ota:*`/`build:android` scripts are PowerShell-only and do not run on Linux — use Gradle directly for builds).
- **Lint**: `yarn lint`. NOTE: it lints `.` with no `.eslintignore`, so it also lints the committed 12 MB `bundle.android.js` and reports hundreds of thousands of pre-existing warnings/errors. This is the repo's existing state, not an environment problem.
- **Tests**: `yarn test` (Jest). All suites currently fail as-is: most `src/**/test.js` files are misnamed source files (not tests) and `__tests__/App.test.tsx` needs native-module mocks that the repo does not provide. These are pre-existing repo issues.

### Android emulator caveat (important)
This VM has **no `/dev/kvm`**, so the emulator only runs via slow software emulation (TCG). An AVD (`test35`) will boot, but `system_server` gets killed by the Android watchdog during heavy operations (e.g. installing the ~88 MB APK), so installing/launching this large app on the emulator is **not reliably possible here**. Prefer demonstrating the app via the Gradle build + Metro-served bundle. To launch the emulator (best effort): `emulator -avd test35 -no-window -no-audio -gpu swiftshader_indirect -no-accel`.
