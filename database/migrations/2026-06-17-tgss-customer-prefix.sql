-- Optional migration for test/demo data only.
-- New customers automatically use TGSS prefixes after backend deploy.
-- Run this only if you want existing old-format demo/customer codes converted.

UPDATE customers
SET customer_code = regexp_replace(customer_code, '^GST-', 'TGSS-')
WHERE customer_code LIKE 'GST-%';

UPDATE customers
SET referral_code = regexp_replace(referral_code, '^GENTS', 'TGSS')
WHERE referral_code LIKE 'GENTS%';
