const express = require('express');
const { z } = require('zod');
const { query } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { uploadDataImage } = require('../services/storageService');

const router = express.Router();

router.get('/', asyncHandler(async (_req, res) => {
  const result = await query(
    `SELECT id, reviewer_name, rating, comment, review_image_url, source, google_review_url, approved, created_at
     FROM reviews
     WHERE approved = TRUE
     ORDER BY created_at DESC
     LIMIT 50`,
  );

  res.json({ success: true, data: result.rows });
}));

router.post('/', validate(z.object({
  body: z.object({
    customerId: z.string().uuid().optional().nullable(),
    reviewerName: z.string().min(2).max(160),
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(3).max(1200),
    reviewImageUrl: z.string().optional().nullable(),
    googleReviewUrl: z.string().optional().nullable(),
  }),
})), asyncHandler(async (req, res) => {
  const body = req.body;

  if (body.reviewImageUrl && !String(body.reviewImageUrl).startsWith('data:image/')) {
    throw new ApiError(400, 'Review image must be a data:image URI');
  }

  const result = await query(
    `INSERT INTO reviews (customer_id, reviewer_name, rating, comment, review_image_url, source, google_review_url, approved)
     VALUES ($1,$2,$3,$4,$5,'app',$6,FALSE)
     RETURNING *`,
    [
      body.customerId || null,
      body.reviewerName,
      body.rating,
      body.comment,
      reviewImageUrl,
      body.googleReviewUrl || null,
    ],
  );

  res.status(201).json({
    success: true,
    data: result.rows[0],
    message: 'Review submitted. It will appear after admin approval.',
  });
}));

router.get('/admin/all', requireAdmin, asyncHandler(async (_req, res) => {
  const result = await query(
    `SELECT r.*, c.full_name AS customer_name, c.phone AS customer_phone, c.profile_image_url AS customer_photo
     FROM reviews r
     LEFT JOIN customers c ON c.id = r.customer_id
     ORDER BY r.created_at DESC
     LIMIT 300`,
  );

  res.json({ success: true, data: result.rows });
}));

router.put('/admin/:id/approve', requireAdmin, asyncHandler(async (req, res) => {
  const result = await query('UPDATE reviews SET approved = TRUE WHERE id = $1 RETURNING *', [req.params.id]);
  if (!result.rowCount) throw new ApiError(404, 'Review not found');
  res.json({ success: true, data: result.rows[0] });
}));

router.put('/admin/:id/reject', requireAdmin, asyncHandler(async (req, res) => {
  const result = await query('UPDATE reviews SET approved = FALSE WHERE id = $1 RETURNING *', [req.params.id]);
  if (!result.rowCount) throw new ApiError(404, 'Review not found');
  res.json({ success: true, data: result.rows[0] });
}));

module.exports = router;
