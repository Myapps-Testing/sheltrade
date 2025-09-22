-- Add reference fields to link transactions with their corresponding activities
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS wallet_deposit_id uuid;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS wallet_withdrawal_id uuid;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_giftcard_id uuid;

-- Add reference field to wallet activities to link back to transactions
ALTER TABLE wallet_deposit ADD COLUMN IF NOT EXISTS transaction_id uuid;
ALTER TABLE wallet_withdrawal ADD COLUMN IF NOT EXISTS transaction_id uuid;
ALTER TABLE user_giftcards ADD COLUMN IF NOT EXISTS main_transaction_id uuid;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_deposit_id ON transactions(wallet_deposit_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_withdrawal_id ON transactions(wallet_withdrawal_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_giftcard_id ON transactions(user_giftcard_id);
CREATE INDEX IF NOT EXISTS idx_wallet_deposit_transaction_id ON wallet_deposit(transaction_id);
CREATE INDEX IF NOT EXISTS idx_wallet_withdrawal_transaction_id ON wallet_withdrawal(transaction_id);
CREATE INDEX IF NOT EXISTS idx_user_giftcards_main_transaction_id ON user_giftcards(main_transaction_id);