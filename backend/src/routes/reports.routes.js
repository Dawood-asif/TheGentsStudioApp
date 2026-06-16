const express = require('express');
const { query } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/dashboard', requireAdmin, asyncHandler(async (_req, res) => {
  const [customers, appointments, stamps, revenue, todayAppointments, inventoryLow] = await Promise.all([
    query('SELECT COUNT(*)::int AS total_customers FROM customers'),
    query('SELECT COUNT(*)::int AS total_appointments FROM appointments'),
    query("SELECT COALESCE(SUM(stamps_delta), 0)::int AS total_stamps FROM stamp_transactions WHERE stamps_delta > 0"),
    query("SELECT COALESCE(SUM(package_total), 0)::int AS revenue_pkr FROM appointments WHERE status = 'completed'"),
    query("SELECT COUNT(*)::int AS today_appointments FROM appointments WHERE appointment_at::date = CURRENT_DATE"),
    query('SELECT COUNT(*)::int AS low_stock_items FROM inventory WHERE active = TRUE AND quantity <= reorder_level'),
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
    },
  });
}));

module.exports = router;
