-- ============================================================
-- KRISHX Markets — Supabase Database Setup
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Profiles table (one row per user)
CREATE TABLE IF NOT EXISTS public.profiles (
  id      uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric(20, 8) NOT NULL DEFAULT 10000,
  btc     numeric(20, 8) NOT NULL DEFAULT 0,
  eth     numeric(20, 8) NOT NULL DEFAULT 0,
  gold    numeric(20, 8) NOT NULL DEFAULT 0,
  aapl    numeric(20, 8) NOT NULL DEFAULT 0
);

-- 2. Transactions table (trade history)
CREATE TABLE IF NOT EXISTS public.transactions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       text NOT NULL CHECK (type IN ('buy', 'sell')),
  asset      text NOT NULL CHECK (asset IN ('BTC', 'ETH', 'GOLD', 'AAPL')),
  amount     numeric(20, 8) NOT NULL,
  price      numeric(20, 8) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Row Level Security — users can only see and edit their own data

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Transactions policies
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Optional: Auto-create profile on signup (alternative to doing it in React)
--    Uncomment if you prefer a database trigger approach:
--
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO public.profiles (id) VALUES (new.id)
--   ON CONFLICT (id) DO NOTHING;
--   RETURN new;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
--
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
