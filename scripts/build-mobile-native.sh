#!/usr/bin/env bash
set -euo pipefail

# This script creates a real React Native 0.72.3 native project and copies the mobile scaffold into it.
# Requirements on your computer: Node, JDK 17, Android Studio SDK, Android platform tools.

SOURCE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="${1:-$HOME/TheGentsStudioMobile}"
API_URL="${API_URL:-http://10.0.2.2:5000}"

if [[ -e "$TARGET_DIR" ]]; then
  echo "Target already exists: $TARGET_DIR"
  echo "Delete it or pass a different target path."
  exit 1
fi

echo "Creating React Native project at: $TARGET_DIR"
npx react-native@0.72.3 init TheGentsStudioMobile --version 0.72.3 --directory "$TARGET_DIR"

cp -R "$SOURCE_ROOT/mobile/src" "$TARGET_DIR/"
cp "$SOURCE_ROOT/mobile/package.json" "$TARGET_DIR/package.json"
cp "$SOURCE_ROOT/mobile/app.json" "$TARGET_DIR/app.json"
cp "$SOURCE_ROOT/mobile/index.js" "$TARGET_DIR/index.js"
cp "$SOURCE_ROOT/mobile/babel.config.js" "$TARGET_DIR/babel.config.js"

cd "$TARGET_DIR"
npm install --legacy-peer-deps

# Set API URL in JS client.
python3 - <<PY
from pathlib import Path
path = Path('src/api/client.js')
text = path.read_text()
text = text.replace("const API_URL = 'http://10.0.2.2:5000';", "const API_URL = '$API_URL';")
path.write_text(text)
PY

# Android permissions.
MANIFEST="android/app/src/main/AndroidManifest.xml"
python3 - <<'PY'
from pathlib import Path
path = Path('android/app/src/main/AndroidManifest.xml')
text = path.read_text()
perms = [
    '<uses-permission android:name="android.permission.INTERNET" />',
    '<uses-permission android:name="android.permission.CAMERA" />',
    '<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />',
]
insert = '\n'.join(perms) + '\n'
if 'android.permission.CAMERA' not in text:
    text = text.replace('<manifest', '<manifest', 1)
    idx = text.find('>') + 1
    text = text[:idx] + '\n' + insert + text[idx:]
path.write_text(text)
PY

# Enable VisionCamera code scanner.
if ! grep -q "VisionCamera_enableCodeScanner=true" android/gradle.properties; then
  echo "VisionCamera_enableCodeScanner=true" >> android/gradle.properties
fi

echo "Native project ready at: $TARGET_DIR"
echo "Next: add android/app/google-services.json if using Firebase."
echo "Then build: cd $TARGET_DIR/android && ./gradlew assembleDebug"
