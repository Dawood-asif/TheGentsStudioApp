const VIP_TIERS = [
  { tier_name: 'Elite', min_points: 0, max_points: 1499, discount_percentage: 0, extra_stamps: 0, free_service_every_n: 0, priority_booking: false, badge_color: '#6B7280', benefits: ['Basic rewards', '1 stamp per visit'] },
  { tier_name: 'Signature', min_points: 1500, max_points: 2999, discount_percentage: 5, extra_stamps: 1, free_service_every_n: 0, priority_booking: false, badge_color: '#CD7F32', benefits: ['5% off all services', '+1 bonus stamp', 'Birthday reward'] },
  { tier_name: 'Sovereign', min_points: 3000, max_points: 4999, discount_percentage: 10, extra_stamps: 1, free_service_every_n: 15, priority_booking: false, badge_color: '#C0C0C0', benefits: ['10% off all services', '+1 bonus stamp', 'Free service every 15 visits'] },
  { tier_name: 'Prestige', min_points: 5000, max_points: 7999, discount_percentage: 15, extra_stamps: 2, free_service_every_n: 12, priority_booking: true, badge_color: '#FFD700', benefits: ['15% off all services', '+2 bonus stamps', 'Priority booking', 'Free service every 12 visits'] },
  { tier_name: 'Imperial', min_points: 8000, max_points: 11999, discount_percentage: 20, extra_stamps: 3, free_service_every_n: 10, priority_booking: true, badge_color: '#E5E4E2', benefits: ['20% off all services', '+3 bonus stamps', 'Priority booking + early access', 'Free service every 10 visits'] },
  { tier_name: 'Royal', min_points: 12000, max_points: null, discount_percentage: 25, extra_stamps: 5, free_service_every_n: 8, priority_booking: true, badge_color: '#B9F2FF', benefits: ['25% off all services', '+5 bonus stamps', 'Top priority booking', 'Free service every 8 visits', 'VIP concierge'] }
];

function getTierForPoints(points = 0) {
  const safePoints = Number(points || 0);
  const tier = VIP_TIERS.find(t =>
    safePoints >= t.min_points && (t.max_points === null || safePoints <= t.max_points)
  );
  return tier || VIP_TIERS[0];
}

function getStampsForFreeService() {
  return 15;
}

module.exports = { VIP_TIERS, getTierForPoints, getStampsForFreeService };