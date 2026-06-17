export const VIP_TIERS = [
  {
    id: 'bronze',
    name: 'Bronze',
    minPoints: 0,
    color: '#B87333',
    benefits: ['Member rewards', 'Stamp loyalty access'],
  },
  {
    id: 'silver',
    name: 'Silver',
    minPoints: 500,
    color: '#C0C0C0',
    benefits: ['Priority promo alerts', 'Silver profile badge'],
  },
  {
    id: 'gold',
    name: 'Gold',
    minPoints: 1500,
    color: '#D4AF37',
    benefits: ['Gold profile badge', 'Birthday reward priority'],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    minPoints: 3000,
    color: '#E5E4E2',
    benefits: ['Priority booking by phone', 'Platinum offers'],
  },
  {
    id: 'diamond',
    name: 'Diamond',
    minPoints: 5000,
    color: '#7DD3FC',
    benefits: ['Concierge attention', 'Diamond VIP recognition'],
  },
];

export function getVipTier(points = 0) {
  const safePoints = Number(points || 0);
  return [...VIP_TIERS].reverse().find(tier => safePoints >= tier.minPoints) || VIP_TIERS[0];
}

export function getNextVipTier(points = 0) {
  const safePoints = Number(points || 0);
  return VIP_TIERS.find(tier => safePoints < tier.minPoints) || null;
}

export function getVipProgress(points = 0) {
  const safePoints = Number(points || 0);
  const current = getVipTier(safePoints);
  const next = getNextVipTier(safePoints);
  if (!next) return { current, next: null, progress: 100, pointsNeeded: 0 };
  const range = next.minPoints - current.minPoints;
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
