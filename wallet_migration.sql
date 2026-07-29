-- ============================================================
-- EntryHive Wallet System Migration
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Add wallet_balance column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wallet_balance numeric DEFAULT 0;

-- 2. Create payout_info table
CREATE TABLE IF NOT EXISTS payout_info (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  method text NOT NULL CHECK (method IN ('bank', 'easypaisa', 'jazzcash', 'nayapay')),
  account_number text NOT NULL,
  account_name text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- 3. Add new columns to existing referrals table (keeps old email columns for backward compat)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='referrals' AND column_name='referrer_id') THEN
    ALTER TABLE referrals ADD COLUMN referrer_id uuid REFERENCES profiles(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='referrals' AND column_name='referred_id') THEN
    ALTER TABLE referrals ADD COLUMN referred_id uuid REFERENCES profiles(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='referrals' AND column_name='commission_amount') THEN
    ALTER TABLE referrals ADD COLUMN commission_amount numeric DEFAULT 0;
  END IF;
END $$;

-- 4. Create withdrawal_requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'rejected')),
  rejection_reason text,
  requested_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- 5. RLS Policies

-- Enable RLS on new tables
ALTER TABLE payout_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- payout_info: users can view and manage their own
CREATE POLICY "Users can view own payout_info" ON payout_info FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payout_info" ON payout_info FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own payout_info" ON payout_info FOR UPDATE USING (auth.uid() = user_id);

-- withdrawal_requests: users can view their own and create new ones
CREATE POLICY "Users can view own withdrawals" ON withdrawal_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own withdrawals" ON withdrawal_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- referrals: users can view their own (as referrer)
-- Note: referrals table may already have RLS policies; only add if needed.
-- If RLS is not enabled on referrals yet:
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they conflict (safe to ignore errors)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own referrals" ON referrals;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Users can view own referrals" ON referrals FOR SELECT USING (
  auth.uid() = referrer_id OR referrer_email = (SELECT email FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Users can insert referrals" ON referrals FOR INSERT WITH CHECK (true);

-- 6. Atomic increment_wallet function
CREATE OR REPLACE FUNCTION increment_wallet(p_user_id uuid, p_amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET wallet_balance = COALESCE(wallet_balance, 0) + p_amount
  WHERE id = p_user_id;
END;
$$;
