const express = require('express');
const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

function periodCondition(period) {
  if (period === 'today') return "AND st.transaction_date = CURRENT_DATE";
  if (period === 'week') return "AND st.transaction_date >= CURRENT_DATE - ((EXTRACT(ISODOW FROM CURRENT_DATE)::int - 1) * INTERVAL '1 day')";
  if (period === 'month') return "AND st.transaction_date >= DATE_TRUNC('month', CURRENT_DATE)::date";
  return '';
}

router.get('/', asyncHandler(async (req, res) => {
  const period = ['today', 'week', 'month', 'all'].includes(req.query.period) ? req.query.period : 'all';
  const condition = periodCondition(period);

  const result = await query(
    `SELECT c.id, c.customer_code, c.full_name, c.vip, c.current_streak,
            COALESCE(SUM(CASE WHEN st.points_delta > 0 THEN st.points_delta ELSE 0 END), 0)::int AS period_points,
            c.points AS all_time_points,
            RANK() OVER (ORDER BY ${period === 'all' ? 'c.points' : 'COALESCE(SUM(st.points_delta), 0)'} DESC, c.join_date ASC) AS rank
     FROM customers c
     LEFT JOIN stamp_transactions st ON st.customer_id = c.id ${condition}
     GROUP BY c.id
     ORDER BY rank ASC
     LIMIT 10`,
  );

  res.json({ success: true, period, data: result.rows });
}));

module.exports = router;
