const fs = require('fs');
const path = require('path');

const reviewsPath = path.join(__dirname, 'src', 'routes', 'reviews.routes.js');
const staffPath = path.join(__dirname, 'src', 'routes', 'staff.routes.js');

fs.copyFileSync(reviewsPath, reviewsPath + '.bak');
fs.copyFileSync(staffPath, staffPath + '.bak');

// ========== Fix reviews.routes.js ==========
let reviews = fs.readFileSync(reviewsPath, 'utf8');

reviews = reviews.replace(
  "const ApiError = require('../utils/apiError');",
  "const ApiError = require('../utils/apiError');\nconst { uploadDataImage } = require('../services/storageService');"
);

reviews = reviews.replace(
  `  if (body.reviewImageUrl && !String(body.reviewImageUrl).startsWith('data:image/')) {

    throw new ApiError(400, 'Review image must be a data:image URI');
  }

  const result = await query(`,
  `  let reviewImageUrl = body.reviewImageUrl || null;

  if (reviewImageUrl && String(reviewImageUrl).startsWith('data:image/')) {
    reviewImageUrl = await uploadDataImage({
      imageData: reviewImageUrl,
      folder: 'reviews',
      filePrefix: 'review-' + (body.customerId || 'guest'),
    });
  }

  const result = await query(`
);

reviews = reviews.replace(
  `      body.reviewImageUrl || null,`,
  `      reviewImageUrl,`
);

fs.writeFileSync(reviewsPath, reviews);

// ========== Fix staff.routes.js ==========
let staff = fs.readFileSync(staffPath, 'utf8');

staff = staff.replace(
  "const ApiError = require('../utils/apiError');",
  "const ApiError = require('../utils/apiError');\nconst { uploadDataImage } = require('../services/storageService');"
);

staff = staff.replace(
  `  const result = await query(

    \`INSERT INTO staff (name, specialty, rating, phone, commission_percentage, active, photo_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *\`,
    [name, specialty, rating, phone, commissionPercentage, active, photoUrl],
  );`,
  `  let finalPhotoUrl = photoUrl;
  if (finalPhotoUrl && String(finalPhotoUrl).startsWith('data:image/')) {
    finalPhotoUrl = await uploadDataImage({
      imageData: finalPhotoUrl,
      folder: 'staff',
      filePrefix: 'staff-' + name.replace(/\\s+/g, '-').toLowerCase(),
    });
  }

  const result = await query(

    \`INSERT INTO staff (name, specialty, rating, phone, commission_percentage, active, photo_url)
     VALUES ($1,$2,$3,$4,$5$$6,$7)
     RETURNING *\`,
    [name, specialty, rating, phone, commissionPercentage, active, finalPhotoUrl],
  );`
);

staff = staff.replace(
  `  const result = await query(\`UPDATE staff SET \${sets} WHERE id = \$\${values.length} RETURNING *\`, values);`,
  `  if (req.body.photoUrl && String(req.body.photoUrl).startsWith('data:image/')) {
    req.body.photoUrl = await uploadDataImage({
      imageData: req.body.photoUrl,
      folder: 'staff',
      filePrefix: 'staff-' + req.params.id,
    });
  }

  const result = await query(\`UPDATE staff SET \${sets} WHERE id = \$\${values.length} RETURNING *\`, values);`
);

fs.writeFileSync(staffPath, staff);

console.log('✅ Fixed reviews.routes.js and staff.routes.js');
console.log('Backups created: src/routes/reviews.routes.js.bak, src/routes/staff.routes.js.bak');
