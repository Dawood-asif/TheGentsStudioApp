export const VIP_TIERS = [
  { id: 'member', name: 'Member', minPoints: 0, color: '#A9A9A9' },
  { id: 'bronze', name: 'Bronze', minPoints: 1500, color: '#B87333' },
  { id: 'silver', name: 'Silver', minPoints: 3000, color: '#C0C0C0' },
  { id: 'gold', name: 'Gold', minPoints: 5000, color: '#D4AF37' },
  { id: 'platinum', name: 'Platinum', minPoints: 8000, color: '#E5E4E2' },
  { id: 'diamond', name: 'Diamond', minPoints: 12000, color: '#7DD3FC' },
];

export function normalizeTiers(tiers) {
  const source = Array.isArray(tiers) && tiers.length ? tiers : VIP_TIERS;
  return source
    .map((tier, index) => ({
      id: tier.id || String(tier.name || `tier-${index}`).toLowerCase().replace(/\s+/g, '-'),
      name: tier.name || `Tier ${index + 1}`,
      minPoints: Number(tier.minPoints ?? tier.min_points ?? 0),
      color: tier.color || '#D4AF37',
    }))
    .sort((a, b) => a.minPoints - b.minPoints);
}

export function getVipTier(points = 0, tiers = VIP_TIERS) {
  const safePoints = Number(points || 0);
  const normalized = normalizeTiers(tiers);
  return [...normalized].reverse().find(tier => safePoints >= tier.minPoints) || normalized[0];
}
