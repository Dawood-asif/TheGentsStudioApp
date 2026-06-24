// admin/src/utils/vipTiers.js
// Unified VIP Tiers - Fetched from backend API

export const VIP_TIERS = [
  { id: 'elite', tier_name: 'Elite', minPoints: 0, maxPoints: 1499, discount: 0, color: '#6B7280' },
  { id: 'signature', tier_name: 'Signature', minPoints: 1500, maxPoints: 2999, discount: 5, color: '#CD7F32' },
  { id: 'sovereign', tier_name: 'Sovereign', minPoints: 3000, maxPoints: 4999, discount: 10, color: '#C0C0C0' },
  { id: 'prestige', tier_name: 'Prestige', minPoints: 5000, maxPoints: 7999, discount: 15, color: '#FFD700' },
  { id: 'imperial', tier_name: 'Imperial', minPoints: 8000, maxPoints: 11999, discount: 20, color: '#E5E4E2' },
  { id: 'royal', tier_name: 'Royal', minPoints: 12000, maxPoints: null, discount: 25, color: '#B9F2FF' }
];

export function getVipTier(points = 0) {
  const safe = Number(points || 0);
  return [...VIP_TIERS].reverse().find(t => safe >= t.minPoints) || VIP_TIERS[0];
}

export function getStampsForFreeService() { return 15; }

export function getNextVipTier(points = 0) {
  const safe = Number(points || 0);
  return VIP_TIERS.find(t => safe < t.minPoints) || null;
}

export function getVipProgress(points = 0) {
  const safe = Number(points || 0);
  const current = getVipTier(safe);
  const next = getNextVipTier(safe);
  if (!next) return { current, next: null, progress: 100, pointsNeeded: 0 };
  const range = Math.max(1, next.minPoints - current.minPoints);
  const earned = safe - current.minPoints;
  const progress = Math.max(0, Math.min(100, Math.round((earned / range) * 100)));
  return { current, next, progress, pointsNeeded: next.minPoints - safe };
}