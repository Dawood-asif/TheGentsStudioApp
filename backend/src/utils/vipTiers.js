const VIP_TIERS = [
  { id: 'member', name: 'Member', minPoints: 0, color: '#A9A9A9' },
  { id: 'bronze', name: 'Bronze', minPoints: 1500, color: '#B87333' },
  { id: 'silver', name: 'Silver', minPoints: 3000, color: '#C0C0C0' },
  { id: 'gold', name: 'Gold', minPoints: 5000, color: '#D4AF37' },
  { id: 'platinum', name: 'Platinum', minPoints: 8000, color: '#E5E4E2' },
  { id: 'diamond', name: 'Diamond', minPoints: 12000, color: '#7DD3FC' }
];

function getTierForPoints(points) {
  let result = VIP_TIERS[0];
  for (const tier of VIP_TIERS) {
    if (points >= tier.minPoints) result = tier;
  }
  return result;
}

function getStampsForFreeService() {
  return 15;
}

module.exports = { VIP_TIERS, getTierForPoints, getStampsForFreeService };