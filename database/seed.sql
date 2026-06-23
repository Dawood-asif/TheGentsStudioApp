-- Seed data for The Gents Studio & Spa
-- Run after database/schema.sql.

INSERT INTO settings (key, value) VALUES
  ('business', '{"appName":"The Gents Studio & Spa","audience":"Males only: children, adults, elderly","address":"Shop street 18, Mehar Fiaz Colony Bb, Lahore, 54000, Pakistan","phones":["0301 5092782","0335 2279567"],"operatingHours":"8:00 AM – 9:00 PM","holidaysClosed":["9th Muharram","10th Muharram"]}'::jsonb),
  ('brand', '{"primary":"#0A0A0A","gold":"#D4AF37"}'::jsonb),
  ('loyalty', '{"stampsNeeded":10,"pointsPerStamp":100,"antiCheatOneStampPerDay":true,"rewardType":"FREE_SERVICE","stampExpiryDays":null}'::jsonb),
  ('referral', '{"referrerStamps":2,"referrerPoints":200,"friendDiscountPercent":20}'::jsonb),
  ('packageBuilder', '{"minimumServicesForDiscount":2,"discountPercent":20}'::jsonb),
  ('calendar', '{"enabled":true,"slotMinutes":30,"startHour":8,"endHour":21,"finalConfirmationByPhone":true}'::jsonb),
  ('aiRules', '{"noStaffNames":true,"bookingByPhoneOnly":true,"noServiceDurations":true,"malesOnly":true}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

INSERT INTO services (category, name, price_pkr, active) VALUES
  ('Haircuts', 'Classic Cut', 349, TRUE),
  ('Haircuts', 'Wolf Cut', 699, TRUE),
  ('Haircuts', 'Mullet Cut', 599, TRUE),
  ('Haircuts', 'Bullet Cut', 549, TRUE),
  ('Haircuts', 'Premium Textured Cut', 799, TRUE),
  ('Haircuts', 'Fade + Design', 649, TRUE),
  ('Beard & Shave', 'Classic Shave', 249, TRUE),
  ('Beard & Shave', 'Trimming + Shape', 299, TRUE),
  ('Beard & Shave', 'Italian Beard Styling', 399, TRUE),
  ('Beard & Shave', 'Royal Italian Beard', 499, TRUE),
  ('Beard & Shave', 'Premium Shave (Hot Towel)', 449, TRUE),
  ('Hair Polish', 'Black Polish (Apple Color)', 1599, TRUE),
  ('Hair Polish', 'Brown Polish (Apple Color)', 1599, TRUE),
  ('Hair Polish', 'Elitek Color', 499, TRUE),
  ('Protein & Keratin', 'Protein Treatment (Short)', 2999, TRUE),
  ('Protein & Keratin', 'Protein Treatment (Long)', 5999, TRUE),
  ('Protein & Keratin', 'Keratin Smoothing (Short)', 10999, TRUE),
  ('Protein & Keratin', 'Keratin Smoothing (Long)', 25999, TRUE),
  ('Manicure & Pedicure', 'Manicure', 1899, TRUE),
  ('Manicure & Pedicure', 'Pedicure', 2499, TRUE),
  ('Manicure & Pedicure', 'Combo Mani+Pedi', 3999, TRUE),
  ('Facials', 'Whitening Facial', 1499, TRUE),
  ('Facials', 'Zafrani Facial', 1299, TRUE),
  ('Facials', '7 Shine Facial', 1099, TRUE),
  ('Facials', 'Herbal Facial', 1699, TRUE),
  ('Facials', 'Luminous Saffron Facial', 999, TRUE),
  ('Facials', 'Gold Facial', 2099, TRUE),
  ('Facials', 'Hydra Facial', 3499, TRUE),
  ('Facials', 'Swiss Care Facial', 7499, TRUE),
  ('Facials', 'Johnson''s Facial', 4999, TRUE),
  ('Facials', 'CeraVe Facial', 4499, TRUE),
  ('Head Massages', 'Head Massage (by Hands)', 499, TRUE),
  ('Head Massages', 'Head Massage (by Machine)', 499, TRUE),
  ('Facial Massages', 'Whitening Facial Massage', 749, TRUE),
  ('Facial Massages', 'Zafrani Facial Massage', 649, TRUE),
  ('Facial Massages', '7 Shine Facial Massage', 549, TRUE),
  ('Facial Massages', 'Herbal Facial Massage', 849, TRUE),
  ('Facial Massages', 'Luminous Saffron Facial Massage', 499, TRUE),
  ('Facial Massages', 'Gold Facial Massage', 1049, TRUE),
  ('Facial Massages', 'Hydra Facial Massage', 1749, TRUE),
  ('Facial Massages', 'Swiss Care Facial Massage', 3749, TRUE),
  ('Facial Massages', 'Johnson''s Facial Massage', 2499, TRUE),
  ('Facial Massages', 'CeraVe Facial Massage', 2249, TRUE),
  ('Add-ons / Extras', 'Steam (+Facial)', 499, TRUE),
  ('Add-ons / Extras', 'Hydra Machine (+Facial)', 3499, TRUE),
  ('Add-ons / Extras', 'Disposable Razor', 129, TRUE),
  ('Add-ons / Extras', 'Threading', 299, TRUE),
  ('Add-ons / Extras', 'Hairstyling', 399, TRUE),
  ('Add-ons / Extras', 'Charcoal Mask', 299, TRUE),
  ('Add-ons / Extras', 'Nose Strip', 149, TRUE),
  ('Add-ons / Extras', 'Legs Waxing', 1699, TRUE),
  ('Add-ons / Extras', 'Arms/Hands Waxing', 1199, TRUE),
  ('Add-ons / Extras', 'Face Waxing', 899, TRUE),
  ('Add-ons / Extras', 'Custom Add-on (Admin Editable)', 0, TRUE)
ON CONFLICT (name) DO UPDATE SET category = EXCLUDED.category, price_pkr = EXCLUDED.price_pkr, active = EXCLUDED.active;

INSERT INTO staff (name, specialty, rating, phone, commission_percentage, active) VALUES
  ('Harry', 'Master Barber - Precision Fades & Scissor Cuts', 5, '0301 5092782', 0, TRUE),
  ('Wahid', 'Beard Specialist - Hot Towel Shaves & Shaping', 5, '0301 5092782', 0, TRUE),
  ('Bilal', 'Color Expert - Hair Coloring & Highlights', 5, '0301 5092782', 0, TRUE),
  ('Aman', 'Skin & Spa Therapist - Facials & Scalp Treatments', 5, '0301 5092782', 0, TRUE),
  ('Gulfam', 'Classic Cuts Specialist - Traditional & Military', 5, '0301 5092782', 0, TRUE),
  ('Fakhar', 'Kids & Curly Hair Specialist', 5, '0301 5092782', 0, TRUE),
  ('Abdul Rehman', 'Luxury Grooming Expert - Complete Packages', 5, '0301 5092782', 0, TRUE)
ON CONFLICT (name) DO UPDATE SET specialty = EXCLUDED.specialty, rating = EXCLUDED.rating, phone = EXCLUDED.phone, commission_percentage = EXCLUDED.commission_percentage, active = EXCLUDED.active;

INSERT INTO admin_users (email, password_hash, full_name, active) VALUES
  ('admin@thegentsstudio.com', '$2a$10$Ohy2EVAl1jJ.vz5PGpZqxewoy7HcsxF9Hi7Kkzh8ZB8hayM9tvUKS', 'Owner Admin', TRUE)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, active = TRUE, updated_at = NOW();

INSERT INTO inventory (item_name, category, quantity, unit, reorder_level, notes) VALUES
  ('Shampoo', 'Supplies', 12, 'bottles', 5, 'Starter stock'),
  ('Hair Color', 'Colors', 8, 'packs', 4, 'Starter stock'),
  ('Disposable Razors', 'Hygiene', 100, 'pcs', 25, 'Starter stock'),
  ('Face Towels', 'Supplies', 40, 'pcs', 10, 'Starter stock');
