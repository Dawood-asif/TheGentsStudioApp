export const VIP_TIERS = [
  {
    id: 'member',
    name: 'Member',
    minPoints: 0,
    color: '#A9A9A9',
    benefits: ['Member rewards', 'Stamp loyalty access'],
  },
  {
    id: 'bronze',
    name: 'Bronze',
    minPoints: 1500,
    color: '#B87333',
    benefits: ['Bronze badge after 15 visits', 'Priority promo alerts'],
  },
  {
    id: 'silver',
    name: 'Silver',
    minPoints: 3000,
    color: '#C0C0C0',
    benefits: ['Silver profile badge', 'Birthday reward priority'],
  },
  {
    id: 'gold',
    name: 'Gold',
    minPoints: 5000,
    color: '#D4AF37',
    benefits: ['Gold VIP recognition', 'Priority booking by phone'],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    minPoints: 8000,
    color: '#E5E4E2',
    benefits: ['Platinum offers', 'Concierge service button'],
  },
  {
    id: 'diamond',
    name: 'Diamond',
    minPoints: 12000,
    color: '#7DD3FC',
    benefits: ['Diamond VIP recognition', 'Top-tier TGSS status'],
  },
];

function normalizeTiers(tiers) {
  const source = Array.isArray(tiers) && tiers.length ? tiers : VIP_TIERS;
  return source
    .map((tier, index) => ({
      id: tier.id || String(tier.name || `tier-${index}`).toLowerCase().replace(/\s+/g, '-'),
      name: tier.name || `Tier ${index + 1}`,
      minPoints: Number(tier.minPoints ?? tier.min_points ?? 0),
      color: tier.color || '#D4AF37',
      benefits: Array.isArray(tier.benefits) ? tier.benefits : [],
    }))
    .sort((a, b) => a.minPoints - b.minPoints);
}

export function getVipTier(points = 0, tiers = VIP_TIERS) {
  const safePoints = Number(points || 0);
  const normalized = normalizeTiers(tiers);
  return [...normalized].reverse().find(tier => safePoints >= tier.minPoints) || normalized[0];
}

export function getNextVipTier(points = 0, tiers = VIP_TIERS) {
  const safePoints = Number(points || 0);
  return normalizeTiers(tiers).find(tier => safePoints < tier.minPoints) || null;
}

export function getVipProgress(points = 0, tiers = VIP_TIERS) {
  const safePoints = Number(points || 0);
  const current = getVipTier(safePoints, tiers);
  const next = getNextVipTier(safePoints, tiers);
  if (!next) return { current, next: null, progress: 100, pointsNeeded: 0 };
  const range = Math.max(1, next.minPoints - current.minPoints);
  const earned = safePoints - current.minPoints;
  const progress = Math.max(0, Math.min(100, Math.round((earned / range) * 100)));
  return { current, next, progress, pointsNeeded: next.minPoints - safePoints };
}

export function getAchievements(customer = {}) {
  const achievements = [
    {
      id: 'first-visit',
      title: 'First Visit',
      unlocked: Number(customer.visits || 0) >= 1,
      description: 'Started the grooming journey',
    },
    {
      id: 'bronze-path',
      title: 'Bronze Path',
      unlocked: Number(customer.points || 0) >= 1500,
      description: 'Reached 1,500 points / 15 visits',
    },
    {
      id: 'stamp-starter',
      title: 'Stamp Starter',
      unlocked: Number(customer.stamps || 0) >= 3,
      description: 'Collected 3 loyalty stamps',
    },
    {
      id: 'reward-hunter',
      title: 'Reward Hunter',
      unlocked: Number(customer.stamps || 0) >= 10,
      description: 'Reached a free-service stamp cycle',
    },
    {
      id: 'streak-king',
      title: 'Streak King',
      unlocked: Number(customer.currentStreak || 0) >= 4,
      description: 'Kept a 4-week grooming streak',
    },
    {
      id: 'vip-profile',
      title: 'VIP Identity',
      unlocked: Boolean(customer.profileImageUrl || customer.profile_image_url),
      description: 'Added a profile photo',
    },
  ];

  return achievements;
}
