const { withTransaction } = require('../config/db');
const ApiError = require('../utils/apiError');

const STREAK_REWARDS = {
  2: { points: 50, stamps: 0, freeService: 0, label: '2 week streak: +50 points' },
  4: { points: 100, stamps: 1, freeService: 0, label: '4 week streak: +100 points + 1 stamp' },
  6: { points: 200, stamps: 2, freeService: 0, label: '6 week streak: +200 points + 2 stamps' },
  8: { points: 500, stamps: 3, freeService: 0, label: '8 week streak: +500 points + 3 stamps' },
  10: { points: 0, stamps: 0, freeService: 1, label: '10 week streak: FREE SERVICE' },
};

function startOfWeek(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function diffWeeks(a, b) {
  const ms = startOfWeek(a).getTime() - startOfWeek(b).getTime();
  return Math.round(ms / (7 * 24 * 60 * 60 * 1000));
}

function calculateStreak(previousDate, previousStreak, today = new Date()) {
  if (!previousDate) return { currentStreak: 1, changed: true };
  const previous = new Date(previousDate);
  const gap = diffWeeks(today, previous);
  if (gap === 0) return { currentStreak: previousStreak || 1, changed: false };
  if (gap === 1) return { currentStreak: (previousStreak || 0) + 1, changed: true };
  return { currentStreak: 1, changed: true };
}

async function addVisitStamp({ customerId, customerCode, phone, serviceId, appointmentId, adminId, note }) {
  return withTransaction(async client => {
    const identifierWhere = customerId ? 'id = $1' : customerCode ? 'customer_code = $1' : phone ? 'phone = $1' : null;
    const identifierValue = customerId || customerCode || phone;
    if (!identifierWhere) throw new ApiError(400, 'customerId, customerCode, or phone is required');

    const customerResult = await client.query(`SELECT * FROM customers WHERE ${identifierWhere} FOR UPDATE`, [identifierValue]);
    if (!customerResult.rowCount) throw new ApiError(404, 'Customer not found');
    const customer = customerResult.rows[0];

    const existingToday = await client.query(
      `SELECT id FROM stamp_transactions
       WHERE customer_id = $1 AND source = 'visit' AND transaction_date = CURRENT_DATE AND stamps_delta > 0
       LIMIT 1`,
      [customer.id],
    );
    if (existingToday.rowCount) throw new ApiError(409, 'Anti-cheat: customer already received a visit stamp today');

    const settingsResult = await client.query("SELECT value FROM settings WHERE key = 'loyalty'");
    const loyalty = settingsResult.rows[0]?.value || { stampsNeeded: 10, pointsPerStamp: 100, rewardType: 'FREE_SERVICE' };
    const pointsPerStamp = Number(loyalty.pointsPerStamp || 100);
    const stampsNeeded = Number(loyalty.stampsNeeded || 10);

    const streak = calculateStreak(customer.last_visit_date, customer.current_streak, new Date());
    const milestone = streak.changed ? STREAK_REWARDS[streak.currentStreak] : null;
    const rewardStamps = milestone?.stamps || 0;
    const rewardPoints = milestone?.points || 0;
    const freeServiceRewards = milestone?.freeService || 0;

    const baseStamps = 1;
    const basePoints = pointsPerStamp;
    const oldStamps = Number(customer.stamps || 0);
    const newStamps = oldStamps + baseStamps + rewardStamps;
    const newPoints = Number(customer.points || 0) + basePoints + rewardPoints;
    const newStreak = streak.currentStreak;
    const newLongest = Math.max(Number(customer.longest_streak || 0), newStreak);
    const rewardUnlocked = Math.floor(newStamps / stampsNeeded) > Math.floor(oldStamps / stampsNeeded);

    await client.query(
      `INSERT INTO stamp_transactions (customer_id, service_id, appointment_id, stamps_delta, points_delta, source, note, created_by_admin_id)
       VALUES ($1,$2,$3,$4,$5,'visit',$6,$7)`,
      [customer.id, serviceId || null, appointmentId || null, baseStamps, basePoints, note || 'Visit stamp', adminId || null],
    );

    if (milestone && (rewardStamps || rewardPoints || freeServiceRewards)) {
      await client.query(
        `INSERT INTO stamp_transactions (customer_id, stamps_delta, points_delta, source, note, created_by_admin_id)
         VALUES ($1,$2,$3,'streak_reward',$4,$5)`,
        [customer.id, rewardStamps, rewardPoints, milestone.label, adminId || null],
      );
    }

    const updated = await client.query(
      `UPDATE customers
       SET stamps = $1,
           points = $2,
           visits = visits + 1,
           current_streak = $3,
           longest_streak = $4,
           last_visit_date = CURRENT_DATE,
           free_service_rewards = free_service_rewards + $5,
           vip = CASE WHEN $2 >= 5000 OR vip = TRUE THEN TRUE ELSE FALSE END
       WHERE id = $6
       RETURNING *`,
      [newStamps, newPoints, newStreak, newLongest, freeServiceRewards, customer.id],
    );

    return {
      customer: updated.rows[0],
      stamp: { stampsAdded: baseStamps, pointsAdded: basePoints },
      rewardUnlocked,
      rewardMessage: rewardUnlocked ? `${stampsNeeded} stamps reached — ${loyalty.rewardType || 'FREE_SERVICE'} reward available` : null,
      streakMilestone: milestone || null,
    };
  });
}

module.exports = { addVisitStamp, calculateStreak, STREAK_REWARDS };
