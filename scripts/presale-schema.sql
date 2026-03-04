-- Presale invite codes
CREATE TABLE IF NOT EXISTS presale_invite_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  max_uses INT NOT NULL DEFAULT 1,
  used_count INT NOT NULL DEFAULT 0,
  created_by VARCHAR(255),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invite_codes_code ON presale_invite_codes (code);

-- Presale email whitelist
CREATE TABLE IF NOT EXISTS presale_whitelist (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  cognito_username VARCHAR(255),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_whitelist_email ON presale_whitelist (email);

-- Presale access log (audit trail)
CREATE TABLE IF NOT EXISTS presale_access_log (
  id SERIAL PRIMARY KEY,
  method VARCHAR(20) NOT NULL, -- 'invite_code' or 'whitelist_otp'
  identifier VARCHAR(255) NOT NULL, -- code or email
  ip_address VARCHAR(45),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Example: insert a test invite code (valid for 100 uses, expires in 90 days)
-- INSERT INTO presale_invite_codes (code, max_uses, created_by, expires_at)
-- VALUES ('ANCESTRO-VIP-2026', 100, 'admin', NOW() + INTERVAL '90 days');

-- Example: add an email to the whitelist
-- INSERT INTO presale_whitelist (email, name)
-- VALUES ('user@example.com', 'John Doe');
