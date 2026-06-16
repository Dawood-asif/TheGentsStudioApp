function normalizePakistaniPhone(phone) {
  const raw = String(phone || '').trim().replace(/[\s-]/g, '');
  if (!raw) return raw;
  if (raw.startsWith('+')) return raw;
  if (raw.startsWith('00')) return `+${raw.slice(2)}`;
  if (raw.startsWith('0')) return `+92${raw.slice(1)}`;
  if (raw.startsWith('92')) return `+${raw}`;
  return raw;
}

module.exports = { normalizePakistaniPhone };
