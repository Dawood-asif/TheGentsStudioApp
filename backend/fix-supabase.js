const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'app.js');
const custPath = path.join(__dirname, 'src', 'routes', 'customers.routes.js');

fs.copyFileSync(appPath, appPath + '.bak');
fs.copyFileSync(custPath, custPath + '.bak');

let app = fs.readFileSync(appPath, 'utf8');
app = app.replace("app.use('/api/media', mediaRoutes);\n", '');
app = app.replace(
  "app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));\n",
  "app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));\napp.use('/api/media', mediaRoutes);\n"
);
fs.writeFileSync(appPath, app);

let cust = fs.readFileSync(custPath, 'utf8');
cust = cust.replace(
  "const { verifyOtp } = require('../services/otpService');",
  "const { verifyOtp } = require('../services/otpService');\nconst { uploadDataImage } = require('../services/storageService');"
);

const oldBlock = `  const result = await query(
    'UPDATE customers SET profile_image_url = $1 WHERE id = $2 RETURNING id, customer_code, full_name, phone, email, profile_image_url',
    [imageData, req.params.id],
  );`;

const newBlock = `  const publicUrl = await uploadDataImage({ imageData, folder: 'customers', filePrefix: 'customer-' + req.params.id });

  const result = await query(
    'UPDATE customers SET profile_image_url = $1 WHERE id = $2 RETURNING id, customer_code, full_name, phone, email, profile_image_url',
    [publicUrl, req.params.id],
  );`;

cust = cust.replace(oldBlock, newBlock);
fs.writeFileSync(custPath, cust);

console.log('✅ Fixed app.js and customers.routes.js');
console.log('Backups created: src/app.js.bak, src/routes/customers.routes.js.bak');
