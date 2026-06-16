const fs = require('fs');
const path = process.argv[2];

if (!path) {
  console.error('Usage: node scripts/firebase-service-account-to-env.js /path/to/firebase-service-account.json');
  process.exit(1);
}

const raw = fs.readFileSync(path, 'utf8');
const parsed = JSON.parse(raw);
const required = ['type', 'project_id', 'private_key', 'client_email'];
for (const key of required) {
  if (!parsed[key]) {
    console.error(`Invalid service account: missing ${key}`);
    process.exit(1);
  }
}

console.log('Copy this into Render environment variables:\n');
console.log(`FIREBASE_SERVICE_ACCOUNT_JSON=${JSON.stringify(parsed)}`);
console.log('\nProject:', parsed.project_id);
console.log('Client email:', parsed.client_email);
