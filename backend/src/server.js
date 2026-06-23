const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'The Gents Studio Backend' });
});

app.get('/api/settings/vip-tiers', (req, res) => {
  res.json({
    success: true,
    data: [
      { tier_name: "Elite", min_points: 0, max_points: 1499, discount_percentage: 0 },
      { tier_name: "Signature", min_points: 1500, max_points: 2999, discount_percentage: 5 },
      { tier_name: "Sovereign", min_points: 3000, max_points: 4999, discount_percentage: 10 },
      { tier_name: "Prestige", min_points: 5000, max_points: 7999, discount_percentage: 15 },
      { tier_name: "Imperial", min_points: 8000, max_points: 11999, discount_percentage: 20 },
      { tier_name: "Royal", min_points: 12000, max_points: null, discount_percentage: 25 }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});