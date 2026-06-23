const express = require('express');
const { z } = require('zod');
const { withTransaction } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

const router = express.Router();

router.post('/apply', requireAdmin, validate(z.object({
  body: z.object({
    friendCustomerId: z.string().uuid(),
    referralCode: z.string().min(6),
  }),
})), asyncHandler(async (req, res) => {
  const { friendCustomerId, referralCode } = req.body;

  const result = await withTransaction(async client => {
    const referrerResult = await client.query('SELECT * FROM customers WHERE referral_code = $1 FOR UPDATE', [referralCode]);
    if (!referrerResult.rowCount) throw new ApiError(404, 'Referral code not found');
    const referrer = referrerResult.rows[0];

    if (referrer.id === friendCustomerId) throw new ApiError(400, 'Customer cannot refer himself');

    const friendResult = await client.query('SELECT * FROM customers WHERE id = $1', [friendCustomerId]);
    if (!friendResult.rowCount) throw new ApiError(404, 'Friend customer not found');

    const existing = await client.query('SELECT id FROM referrals WHERE friend_customer_id = $1 AND status = $2', [friendCustomerId, 'rewarded']);
    if (existing.rowCount) throw new ApiError(409, 'Referral already rewarded for this customer');

    const settingsResult = await client.query("SELECT value FROM settings WHERE key = 'referral'");
    const referral = settingsResult.rows[0]?.value || { referrerStamps: 2, referrerPoints: 200, friendDiscountPercent: 20 };

    await client.query(
      `INSERT INTO referrals (referrer_customer_id, friend_customer_id, referral_code, friend_discount_percent, referrer_stamps_awarded, referrer_points_awarded, status, rewarded_at)
       VALUES ($1,$2,$3,$4,$5,$6,'rewarded',NOW())
       ON CONFLICT (referrer_customer_id, friend_customer_id)
       DO UPDATE SET status = 'rewarded', rewarded_at = NOW()
       RETURNING *`,
      [referrer.id, friendCustomerId, referralCode, referral.friendDiscountPercent, referral.referrerStamps, referral.referrerPoints],
    );

    await client.query(
      `INSERT INTO stamp_transactions (customer_id, stamps_delta, points_delta, source, note, created_by_admin_id)
       VALUES ($1,$2,$3,'referral_reward','Referral reward',$4)`,
      [referrer.id, referral.referrerStamps, referral.referrerPoints, req.admin.id],
    );

    const updated = await client.query(
      'UPDATE customers SET stamps = stamps + $1, points = points + $2 WHERE id = $3 RETURNING *',
      [referral.referrerStamps, referral.referrerPoints, referrer.id],
    );

    return { referrer: updated.rows[0], friendDiscountPercent: referral.friendDiscountPercent };
  });

  res.json({ success: true, data: result });
}));

module.exports = router;
