-- Add currency column to sheltradeadmin_bankdetail table
ALTER TABLE public.sheltradeadmin_bankdetail 
ADD COLUMN currency text NOT NULL DEFAULT 'NGN';

-- Enable realtime for wallets table
ALTER TABLE public.wallets REPLICA IDENTITY FULL;

-- Add wallets to realtime publication (create if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'wallets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
  END IF;
END
$$;

-- Add transactions to realtime publication for live updates
ALTER TABLE public.transactions REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
  END IF;
END
$$;