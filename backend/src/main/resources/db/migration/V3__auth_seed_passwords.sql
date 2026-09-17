UPDATE users
SET password_hash = '{noop}customer123'
WHERE email = 'customer+mocvan2026@gmail.com'
  AND password_hash IS NULL;

UPDATE users
SET password_hash = '{noop}admin123'
WHERE email = 'mocvan2026@gmail.com';

UPDATE users
SET password_hash = '{noop}staff123'
WHERE email = 'staff+mocvan2026@gmail.com';
