import React, { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import DataTable from '../components/DataTable.jsx';
import { VIP_TIERS, normalizeTiers } from '../utils/vipTiers.js';

const DEFAULT_BIRTHDAY_REWARD = {
  enabled: true,
  title: 'Birthday Royal Surprise',
  message: 'Happy Birthday, Boss! Enjoy 20% off your birthday visit at The Gents Studio & Spa.',
  discountPercent: 20,
  validDays: 7,
};
const DEFAULT_ACHIEVEMENT_REWARDS = [
  {
    id: 'first-visit',
    title: 'First Visit',
    description: 'Complete your first TGSS visit',
    reward: '+50 points',
    rewardType: 'points',
    rewardValue: 50,
  },
  {
    id: 'stamp-starter',
    title: 'Stamp Starter',
    description: 'Collect 3 loyalty stamps',
    reward: '+1 bonus stamp',
    rewardType: 'stamps',
    rewardValue: 1,
  },
  {
    id: 'bronze-path',
    title: 'Bronze Path',
    description: 'Reach Bronze VIP status',
    reward: 'Bronze member badge',
    rewardType: 'badge',
    rewardValue: 0,
  },
  {
    id: 'streak-king',
    title: 'Streak King',
    description: 'Keep a 4-week grooming streak',
    reward: '+100 points',
    rewardType: 'points',
    rewardValue: 100,
  },
  {
    id: 'mystery-gift',
    title: 'Mystery Gift',
    description: 'Unlock surprise rewards during special events',
    reward: 'Random gift',
    rewardType: 'custom',
    rewardValue: 0,
  },
];
const fallbackSettings = [
  { key: 'business', value: { appName: 'The Gents Studio & Spa', operatingHours: '8:00 AM – 9:00 PM', phones: ['0301 5092782', '0335 2279567'] } },
  { key: 'loyalty', value: { stampsNeeded: 10, pointsPerStamp: 100, rewardType: 'FREE_SERVICE' } },
  { key: 'vipTiers', value: VIP_TIERS },
  { key: 'birthdayReward', value: DEFAULT_BIRTHDAY_REWARD }, { key: 'achievementRewards', value: DEFAULT_ACHIEVEMENT_REWARDS },
  { key: 'referral', value: { referrerStamps: 2, referrerPoints: 200, friendDiscountPercent: 20 } },
  { key: 'packageBuilder', value: { minimumServicesForDiscount: 2, discountPercent: 20 } },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState(fallbackSettings);
  const [vipTiers, setVipTiers] = useState(VIP_TIERS);
  const [birthdayReward, setBirthdayReward] = useState(DEFAULT_BIRTHDAY_REWARD);
  const [message, setMessage] = useState('Fallback settings shown. Connect backend for live editable settings.');

  const load = () => {
    api.settings()
      .then(result => {
        setSettings(result.data);
        const vipRow = result.data.find(item => item.key === 'vipTiers');
        if (Array.isArray(vipRow?.value)) setVipTiers(normalizeTiers(vipRow.value));
        const birthdayRow = result.data.find(item => item.key === 'birthdayReward');
        if (birthdayRow?.value) setBirthdayReward({ ...DEFAULT_BIRTHDAY_REWARD, ...birthdayRow.value });
        setMessage('Live settings loaded.');
      })
      .catch(() => setMessage('Backend offline: fallback settings shown.'));
  };

  useEffect(() => { load(); }, []);

  const updateTier = (index, key, value) => {
    setVipTiers(current => current.map((tier, tierIndex) => (
      tierIndex === index ? { ...tier, [key]: key === 'minPoints' ? Number(value || 0) : value } : tier
    )));
  };

  const updateBirthdayReward = (key, value) => {
    setBirthdayReward(current => ({
      ...current,
      [key]: key === 'enabled'
        ? Boolean(value)
        : ['discountPercent', 'validDays'].includes(key)
          ? Number(value || 0)
          : value,
    }));
  };

  const saveVipTiers = async () => {
    const sorted = normalizeTiers(vipTiers);
    if (sorted[0]?.minPoints !== 0) {
      setMessage('First tier must start at 0 points.');
      return;
    }
    for (let i = 1; i < sorted.length; i += 1) {
      if (sorted[i].minPoints <= sorted[i - 1].minPoints) {
        setMessage('Each VIP tier must have higher points than the previous tier.');
        return;
      }
    }
    try {
      await api.updateSetting('vipTiers', sorted);
      setMessage('VIP tiers saved. Mobile app will use new tier ranges after opening/restarting.');
      load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const saveBirthdayReward = async () => {
    try {
      await api.updateSetting('birthdayReward', birthdayReward);
      setMessage('Birthday reward saved. Mobile app will show the updated birthday surprise.');
      load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const resetVipTiers = () => setVipTiers(VIP_TIERS);

  const columns = [
    { key: 'key', label: 'Setting' },
    { key: 'value', label: 'Value', render: row => <code>{JSON.stringify(row.value)}</code> },
  ];

  return (
    <div className="grid">
      <section className="card">
        <h2>VIP Tier Ranges</h2>
        <p className="muted">Edit when each VIP tier unlocks. Since each visit gives 100 points, Bronze at 1,500 points means 15 visits.</p>
        <div className="vip-editor">
          {vipTiers.map((tier, index) => (
            <div className="vip-editor-row" key={tier.id || index}>
              <input value={tier.name} onChange={event => updateTier(index, 'name', event.target.value)} placeholder="Tier name" />
              <input type="number" min="0" step="100" value={tier.minPoints} onChange={event => updateTier(index, 'minPoints', event.target.value)} placeholder="Min points" />
              <input value={tier.color} onChange={event => updateTier(index, 'color', event.target.value)} placeholder="#D4AF37" />
              <span className="vip-badge" style={{ '--tier-color': tier.color }}>{tier.name || 'Tier'} • {tier.minPoints} pts</span>
            </div>
          ))}
        </div>
        <div className="toolbar">
          <button className="btn" onClick={saveVipTiers}>Save VIP Tiers</button>
          <button className="btn secondary" onClick={resetVipTiers}>Reset Recommended Ranges</button>
        </div>
        <p className="muted">Recommended: Member 0, Bronze 1500, Silver 3000, Gold 5000, Platinum 8000, Diamond 12000.</p>
      </section>

      <section className="card">
        <h2>Birthday Surprise Reward</h2>
        <p className="muted">This appears in the mobile app on the customer birthday and as a countdown before birthday.</p>
        <div className="form-grid">
          <label className="setting-check">
            <input type="checkbox" checked={birthdayReward.enabled} onChange={event => updateBirthdayReward('enabled', event.target.checked)} />
            <span>Enable birthday reward</span>
          </label>
          <input value={birthdayReward.title} onChange={event => updateBirthdayReward('title', event.target.value)} placeholder="Reward title" />
          <textarea value={birthdayReward.message} onChange={event => updateBirthdayReward('message', event.target.value)} placeholder="Birthday message" rows="4" />
          <input type="number" min="0" value={birthdayReward.discountPercent} onChange={event => updateBirthdayReward('discountPercent', event.target.value)} placeholder="Discount percent" />
          <input type="number" min="1" value={birthdayReward.validDays} onChange={event => updateBirthdayReward('validDays', event.target.value)} placeholder="Valid days" />
          <button className="btn" onClick={saveBirthdayReward}>Save Birthday Reward</button>
        </div>
      </section>

      <section className="card">
        <div className="toolbar">
          <button className="btn secondary" onClick={load}>Refresh Settings</button>
        </div>
        <p className="muted">{message}</p>
        <DataTable columns={columns} rows={settings} />
      </section>
    </div>
  );
}
