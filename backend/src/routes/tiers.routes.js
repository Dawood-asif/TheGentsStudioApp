const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { VIP_TIERS, getTierForPoints, getStampsForFreeService } = require('../utils/vipTiers');

router.get('/', async (req, res) => {
  try {
    const dbResult = await query(`
      SELECT tier_name, min_points, max_points, discount_percentage, 
             extra_stamps, free_service_every_n, priority_booking, 
             badge_color, benefits
      FROM vip_tier_settings 
      WHERE is_active = true 
      ORDER BY min_points ASC
    `);

    let tiers = VIP_TIERS;
    if (dbResult.rows.length > 0) {
      tiers = dbResult.rows.map(row => ({
        tier_name: row.tier_name,
        min_points: row.min_points,
        max_points: row.max_points,
        discount_percentage: Number(row.discount_percentage),
        extra_stamps: row.extra_stamps,
        free_service_every_n: row.free_service_every_n,
        priority_booking: row.priority_booking,
        badge_color: row.badge_color,
        benefits: row.benefits || []
      }));
    }

    res.json({
      success: true,
      data: {
        tiers,
        stampsForFreeService: getStampsForFreeService(),
        globalStampsNeeded: 15
      }
    });
  } catch (err) {
    res.json({
      success: true,
      data: {
        tiers: VIP_TIERS,
        stampsForFreeService: getStampsForFreeService(),
        globalStampsNeeded: 15
      }
    });
  }
});

router.get('/current/:points', (req, res) => {
  const points = parseInt(req.params.points) || 0;
  const tier = getTierForPoints(points);
  res.json({ success: true, data: tier });
});

module.exports = router;