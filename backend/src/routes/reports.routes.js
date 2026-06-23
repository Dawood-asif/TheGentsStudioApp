const express = require('express');
const { query } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/dashboard', requireAdmin, asyncHandler(async (_req, res) => {
  const [
    customers,
    appointments,
    stamps,
    revenue,
    todayAppointments,
    inventoryLow,
    customerGrowth,
    revenueTrend,
    stampActivity,
    appointmentStatus,
    vipDistribution,
    topServices,
    lowStockItems,
  ] = await Promise.all([
    query('SELECT COUNT(*)::int AS total_customers FROM customers'),
    query('SELECT COUNT(*)::int AS total_appointments FROM appointments'),
    query("SELECT COALESCE(SUM(stamps_delta), 0)::int AS total_stamps FROM stamp_transactions WHERE stamps_delta > 0"),
    query("SELECT COALESCE(SUM(package_total), 0)::int AS revenue_pkr FROM appointments WHERE status = 'completed'"),
    query("SELECT COUNT(*)::int AS today_appointments FROM appointments WHERE appointment_at::date = CURRENT_DATE"),
    query('SELECT COUNT(*)::int AS low_stock_items FROM inventory WHERE active = TRUE AND quantity <= reorder_level'),

    query(`
      SELECT to_char(months.month, 'Mon YYYY') AS label,
             COUNT(c.id)::int AS value
      FROM generate_series(
        date_trunc('month', CURRENT_DATE) - INTERVAL '5 months',
        date_trunc('month', CURRENT_DATE),
        INTERVAL '1 month'
      ) AS months(month)
      LEFT JOIN customers c ON date_trunc('month', c.join_date) = months.month
      GROUP BY months.month
      ORDER BY months.month
    `),

    query(`
      SELECT to_char(months.month, 'Mon YYYY') AS label,
             COALESCE(SUM(a.package_total), 0)::int AS value
      FROM generate_series(
        date_trunc('month', CURRENT_DATE) - INTERVAL '5 months',
        date_trunc('month', CURRENT_DATE),
        INTERVAL '1 month'
      ) AS months(month)
      LEFT JOIN appointments a
        ON date_trunc('month', COALESCE(a.appointment_at, a.created_at)) = months.month
       AND a.status = 'completed'
      GROUP BY months.month
      ORDER BY months.month
    `),

    query(`
      SELECT to_char(days.day, 'DD Mon') AS label,
             COALESCE(SUM(CASE WHEN st.stamps_delta > 0 THEN st.stamps_delta ELSE 0 END), 0)::int AS value
      FROM generate_series(CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE, INTERVAL '1 day') AS days(day)
      LEFT JOIN stamp_transactions st ON st.transaction_date = days.day::date
      GROUP BY days.day
      ORDER BY days.day
    `),

    query(`
      SELECT status AS label, COUNT(*)::int AS value
      FROM appointments
      GROUP BY status
      ORDER BY value DESC
    `),

    query(`
      SELECT tier AS label, COUNT(*)::int AS value
      FROM (
        SELECT CASE
          WHEN points >= 12000 THEN 'Diamond'
          WHEN points >= 8000 THEN 'Platinum'
          WHEN points >= 5000 THEN 'Gold'
          WHEN points >= 3000 THEN 'Silver'
          WHEN points >= 1500 THEN 'Bronze'
          ELSE 'Member'
        END AS tier
        FROM customers
      ) ranked
      GROUP BY tier
      ORDER BY CASE tier
        WHEN 'Diamond' THEN 6
        WHEN 'Platinum' THEN 5
        WHEN 'Gold' THEN 4
        WHEN 'Silver' THEN 3
        WHEN 'Bronze' THEN 2
        ELSE 1
      END DESC
    `),

    query(`
      SELECT s.name AS label, COUNT(*)::int AS value
      FROM appointments a
      JOIN LATERAL unnest(a.service_ids) AS service_id ON TRUE
      JOIN services s ON s.id = service_id
      GROUP BY s.name
      ORDER BY value DESC, s.name ASC
      LIMIT 7
    `),

    query(`
      SELECT item_name, quantity, unit, reorder_level
      FROM inventory
      WHERE active = TRUE AND quantity <= reorder_level
      ORDER BY quantity ASC, item_name ASC
      LIMIT 8
    `),
  ]);

  res.json({
    success: true,
    data: {
      totalCustomers: customers.rows[0].total_customers,
      totalAppointments: appointments.rows[0].total_appointments,
      totalStamps: stamps.rows[0].total_stamps,
      revenuePkr: revenue.rows[0].revenue_pkr,
      todayAppointments: todayAppointments.rows[0].today_appointments,
      lowStockItems: inventoryLow.rows[0].low_stock_items,
      charts: {
        customerGrowth: customerGrowth.rows,
        revenueTrend: revenueTrend.rows,
        stampActivity: stampActivity.rows,
        appointmentStatus: appointmentStatus.rows,
        vipDistribution: vipDistribution.rows,
        topServices: topServices.rows,
      },
      alerts: {
        lowStockItems: lowStockItems.rows,
      },
    },
  });
}));

module.exports = router;
