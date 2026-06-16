#!/usr/bin/env bash
set -euo pipefail

# Creates native RN project and attempts a debug APK build on a machine with JDK 17 + Android SDK.
# This cannot succeed in the Arena sandbox because Android SDK is not installed here.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="${1:-$HOME/TheGentsStudioMobile}"
API_URL="${API_URL:-http://10.0.2.2:5000}"

if ! command -v java >/dev/null 2>&1; then
  echo "ERROR: Java/JDK is missing. Install JDK 17."
  exit 1
fi

if [[ -z "${ANDROID_HOME:-}${ANDROID_SDK_ROOT:-}" ]]; then
  echo "ERROR: Android SDK not found. Install Android Studio and set ANDROID_HOME or ANDROID_SDK_ROOT."
  exit 1
fi

"$ROOT/scripts/build-mobile-native.sh" "$TARGET_DIR"
cd "$TARGET_DIR/android"
./gradlew assembleDebug

echo "Debug APK built: $TARGET_DIR/android/app/build/outputs/apk/debug/app-debug.apk"
