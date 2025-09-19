-- Create admin bank details table
CREATE TABLE public.sheltradeAdmin_BankDetail (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_type TEXT DEFAULT 'savings',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wallet deposits table
CREATE TABLE public.wallet_deposit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  deposit_method TEXT NOT NULL CHECK (deposit_method IN ('bank_transfer', 'bank_deposit')),
  bank_detail_id UUID REFERENCES public.sheltradeAdmin_BankDetail(id),
  narration TEXT NOT NULL,
  reference_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  paystack_reference TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wallet withdrawals table  
CREATE TABLE public.wallet_withdrawal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  bank_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_type TEXT DEFAULT 'savings',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  reference_number TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sheltradeAdmin_BankDetail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_deposit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_withdrawal ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin bank details (public read)
CREATE POLICY "Anyone can view active bank details" ON public.sheltradeAdmin_BankDetail
  FOR SELECT USING (is_active = true);

-- RLS policies for wallet deposits
CREATE POLICY "Users can view their own deposits" ON public.wallet_deposit
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own deposits" ON public.wallet_deposit
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for wallet withdrawals
CREATE POLICY "Users can view their own withdrawals" ON public.wallet_withdrawal
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own withdrawals" ON public.wallet_withdrawal
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create triggers for timestamp updates
CREATE TRIGGER update_sheltradeAdmin_BankDetail_updated_at
  BEFORE UPDATE ON public.sheltradeAdmin_BankDetail
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallet_deposit_updated_at
  BEFORE UPDATE ON public.wallet_deposit
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallet_withdrawal_updated_at
  BEFORE UPDATE ON public.wallet_withdrawal
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample admin bank details
INSERT INTO public.sheltradeAdmin_BankDetail (bank_name, account_name, account_number, account_type) VALUES
('First Bank of Nigeria', 'Sheltrade Limited', '3021234567', 'current'),
('Guaranty Trust Bank', 'Sheltrade Limited', '0123456789', 'current'),
('Access Bank', 'Sheltrade Limited', '0987654321', 'savings'),
('Zenith Bank', 'Sheltrade Limited', '1234567890', 'current');