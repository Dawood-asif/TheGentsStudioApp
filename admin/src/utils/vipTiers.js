export const VIP_TIERS = [
  { id: 'bronze', name: 'Bronze', minPoints: 0, color: '#B87333' },
  { id: 'silver', name: 'Silver', minPoints: 500, color: '#C0C0C0' },
  { id: 'gold', name: 'Gold', minPoints: 1500, color: '#D4AF37' },
  { id: 'platinum', name: 'Platinum', minPoints: 3000, color: '#E5E4E2' },
  { id: 'diamond', name: 'Diamond', minPoints: 5000, color: '#7DD3FC' },
];

export function getVipTier(points = 0) {
  const safePoints = Number(points || 0);
  return [...VIP_TIERS].reverse().find(tier => safePoints >= tier.minPoints) || VIP_TIERS[0];
}
