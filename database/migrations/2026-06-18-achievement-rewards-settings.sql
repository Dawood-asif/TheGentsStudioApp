INSERT INTO settings (key, value) VALUES (
  'achievementRewards',
  '[
    {
      "id": "first-visit",
      "title": "First Visit",
      "description": "Complete your first TGSS visit",
      "reward": "+50 points",
      "rewardType": "points",
      "rewardValue": 50
    },
    {
      "id": "stamp-starter",
      "title": "Stamp Starter",
      "description": "Collect 3 loyalty stamps",
      "reward": "+1 bonus stamp",
      "rewardType": "stamps",
      "rewardValue": 1
    },
    {
      "id": "bronze-path",
      "title": "Bronze Path",
      "description": "Reach Bronze VIP status",
      "reward": "Bronze member badge",
      "rewardType": "badge",
      "rewardValue": 0
    },
    {
      "id": "streak-king",
      "title": "Streak King",
      "description": "Keep a 4-week grooming streak",
      "reward": "+100 points",
      "rewardType": "points",
      "rewardValue": 100
    },
    {
      "id": "mystery-gift",
      "title": "Mystery Gift",
      "description": "Unlock surprise rewards during special events",
      "reward": "Random gift",
      "rewardType": "custom",
      "rewardValue": 0
    }
  ]'::jsonb
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
