const bcrypt = require('bcryptjs');
const { pool, query } = require('../config/db');
const env = require('../config/env');
const services = require('../data/services');
const staff = require('../data/staff');
const settings = require('../data/settings');

async function seedServices() {
  for (const service of services) {
    await query(
      `INSERT INTO services (category, name, price_pkr, active)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (name) DO UPDATE SET category = EXCLUDED.category, price_pkr = EXCLUDED.price_pkr, active = EXCLUDED.active`,
      [service.category, service.name, service.pricePkr, service.active],
    );
  }
  console.log(`Seeded ${services.length} services.`);
}

async function seedStaff() {
  for (const member of staff) {
    await query(
      `INSERT INTO staff (name, specialty, rating, phone, commission_percentage, active)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (name) DO UPDATE SET specialty = EXCLUDED.specialty, rating = EXCLUDED.rating, phone = EXCLUDED.phone, commission_percentage = EXCLUDED.commission_percentage, active = EXCLUDED.active`,
      [member.name, member.specialty, member.rating, member.phone, member.commissionPercentage, member.active],
    );
  }
  console.log(`Seeded ${staff.length} staff members.`);
}

async function seedSettings() {
  const rows = {
    business: {
      appName: settings.appName,
      audience: settings.audience,
      address: settings.address,
      phones: settings.phones,
      operatingHours: settings.operatingHours,
      holidaysClosed: settings.holidaysClosed,
    },
    brand: settings.brand,
    loyalty: settings.loyalty,
    referral: settings.referral,
        packageBuilder: settings.packageBuilder,

    vipTiers: settings.vipTiers,

    achievementRewards: settings.achievementRewards,

    aiRules: {
      noStaffNames: true,
      bookingByPhoneOnly: true,
      noServiceDurations: true,
      malesOnly: true,
    },
    calendar: {
      enabled: true,
      slotMinutes: 30,
      startHour: 8,
      endHour: 21,
      finalConfirmationByPhone: true,
    },
  };

  for (const [key, value] of Object.entries(rows)) {
    await query(
      `INSERT INTO settings (key, value) VALUES ($1,$2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [key, value],
    );
  }
  console.log('Seeded settings.');
}

async function seedAdmin() {
  const passwordHash = await bcrypt.hash(env.adminPassword, env.bcryptSaltRounds);
  await query(
    `INSERT INTO admin_users (email, password_hash, full_name, active)
     VALUES ($1,$2,$3,TRUE)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, active = TRUE`,
    [env.adminEmail.toLowerCase(), passwordHash, 'Owner Admin'],
  );
  console.log(`Seeded admin user: ${env.adminEmail}`);
}

async function main() {
  await seedServices();
  await seedStaff();
  await seedSettings();
  await seedAdmin();
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await pool.end();
});
