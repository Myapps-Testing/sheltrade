// Dashboard JavaScript

const SUPABASE_URL = 'https://dsljcorhhnushvbvsrmh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbGpjb3JoaG51c2h2YnZzcm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTA1NzksImV4cCI6MjA3MzYyNjU3OX0.-ilw64YADRBXVW3KPKNUxCOEZepXYnL1L-lsj3C4-_E';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let currentWallet = null;

// Check authentication and load user data
async function init() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        window.location.href = 'auth.html';
        return;
    }

    currentUser = session.user;
    document.getElementById('user-email').textContent = currentUser.email;

    await loadWalletData();
    await loadTransactions();
}

// Load wallet balance
async function loadWalletData() {
    try {
        const { data, error } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();

        if (error) throw error;

        currentWallet = data;
        document.getElementById('wallet-balance').textContent = formatCurrency(data.balance);
    } catch (error) {
        console.error('Error loading wallet:', error);
    }
}

// Load recent transactions
async function loadTransactions() {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        const transactionsList = document.getElementById('transactions-list');
        
        if (data.length === 0) {
            transactionsList.innerHTML = '<p class="loading">No transactions yet</p>';
            return;
        }

        transactionsList.innerHTML = data.map(transaction => `
            <div class="transaction-item">
                <div>
                    <div class="transaction-type">${transaction.type}</div>
                    <div class="transaction-date">${formatDate(transaction.created_at)}</div>
                </div>
                <div style="text-align: right;">
                    <div class="transaction-amount">${formatCurrency(transaction.amount)}</div>
                    <span class="transaction-status ${transaction.status}">${transaction.status}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

// Logout handler
document.addEventListener('DOMContentLoaded', function() {
    init();

    document.getElementById('logout-btn').addEventListener('click', async function() {
        await supabase.auth.signOut();
        window.location.href = 'landing.html';
    });

    // Fund wallet modal
    const fundModal = document.getElementById('fund-modal');
    const fundBtn = document.getElementById('fund-wallet-btn');
    const closeBtn = document.querySelector('.modal-close');

    fundBtn.addEventListener('click', async function() {
        fundModal.classList.add('active');
        await loadBankDetails();
    });

    closeBtn.addEventListener('click', function() {
        fundModal.classList.remove('active');
    });

    window.addEventListener('click', function(e) {
        if (e.target === fundModal) {
            fundModal.classList.remove('active');
        }
    });

    // Deposit method change
    document.getElementById('deposit-method').addEventListener('change', async function() {
        if (this.value === 'bank_transfer') {
            await loadBankDetails();
        } else {
            document.getElementById('bank-details').innerHTML = '';
        }
    });

    // Fund form submission
    document.getElementById('fund-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const amount = document.getElementById('fund-amount').value;
        const method = document.getElementById('deposit-method').value;

        try {
            const { data, error } = await supabase
                .from('wallet_deposit')
                .insert([
                    {
                        user_id: currentUser.id,
                        wallet_id: currentWallet.id,
                        amount: parseFloat(amount),
                        deposit_method: method,
                        currency: 'USD',
                        narration: `Deposit via ${method}`,
                        status: 'pending'
                    }
                ]);

            if (error) throw error;

            alert('Deposit request submitted successfully! Your wallet will be credited once payment is confirmed.');
            fundModal.classList.remove('active');
            this.reset();
            await loadTransactions();
        } catch (error) {
            console.error('Error submitting deposit:', error);
            alert('Failed to submit deposit request. Please try again.');
        }
    });

    // Withdraw button
    document.getElementById('withdraw-btn').addEventListener('click', function() {
        alert('Withdrawal feature coming soon!');
    });

    // Buy gift card button
    document.getElementById('buy-giftcard-btn').addEventListener('click', function() {
        alert('Gift card purchase feature coming soon!');
    });
});

// Load bank details for transfer
async function loadBankDetails() {
    try {
        const { data, error } = await supabase
            .from('sheltradeadmin_bankdetail')
            .select('*')
            .eq('is_active', true)
            .single();

        if (error) throw error;

        document.getElementById('bank-details').innerHTML = `
            <h3 style="margin-bottom: 1rem; font-weight: 600;">Bank Transfer Details</h3>
            <p><strong>Bank Name:</strong> ${data.bank_name}</p>
            <p><strong>Account Name:</strong> ${data.account_name}</p>
            <p><strong>Account Number:</strong> ${data.account_number}</p>
            <p><strong>Account Type:</strong> ${data.account_type}</p>
            <p style="margin-top: 1rem; font-size: 0.875rem; color: hsl(var(--muted-foreground));">
                Please transfer the amount to the above account and submit this form. Your wallet will be credited once we confirm the payment.
            </p>
        `;
    } catch (error) {
        console.error('Error loading bank details:', error);
        document.getElementById('bank-details').innerHTML = '<p>Unable to load bank details. Please try again.</p>';
    }
}

// Utility functions
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}
