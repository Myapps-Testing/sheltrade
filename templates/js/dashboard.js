// Enhanced Dashboard JavaScript with Gift Cards and Secure Bank Details

const SUPABASE_URL = 'https://dsljcorhhnushvbvsrmh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbGpjb3JoaG51c2h2YnZzcm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTA1NzksImV4cCI6MjA3MzYyNjU3OX0.-ilw64YADRBXVW3KPKNUxCOEZepXYnL1L-lsj3C4-_E';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let currentWallet = null;
let currentView = 'dashboard';
let selectedGiftCard = null;
let generatedNarration = '';

// Initialize
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
    await loadStats();
    await loadFeaturedGiftCards();
}

// Load wallet data
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
        document.getElementById('main-wallet-balance').textContent = formatCurrency(data.balance);
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

// Load stats
async function loadStats() {
    try {
        // Total transactions
        const { count: transactionCount } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', currentUser.id);

        // Gift cards purchased
        const { count: giftCardCount } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', currentUser.id)
            .eq('type', 'giftcard_purchase');

        // Active users (profiles)
        const { count: userCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        document.getElementById('total-transactions').textContent = transactionCount || 0;
        document.getElementById('gift-cards-sold').textContent = giftCardCount || 0;
        document.getElementById('active-sessions').textContent = (userCount || 0).toLocaleString();
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load featured gift cards
async function loadFeaturedGiftCards() {
    try {
        const { data, error } = await supabase
            .from('giftcards')
            .select('*')
            .eq('is_active', true)
            .order('brand')
            .limit(4);

        if (error) throw error;

        displayGiftCards(data, 'featured-giftcards');
    } catch (error) {
        console.error('Error loading featured gift cards:', error);
    }
}

// Load all gift cards
async function loadAllGiftCards() {
    try {
        const { data, error } = await supabase
            .from('giftcards')
            .select('*')
            .eq('is_active', true)
            .order('brand');

        if (error) throw error;

        displayGiftCards(data, 'all-giftcards');
    } catch (error) {
        console.error('Error loading gift cards:', error);
    }
}

// Display gift cards
function displayGiftCards(giftCards, containerId) {
    const container = document.getElementById(containerId);
    
    if (giftCards.length === 0) {
        container.innerHTML = '<p class="loading">No gift cards available</p>';
        return;
    }

    container.innerHTML = giftCards.map(card => `
        <div class="giftcard-item" onclick="selectGiftCard('${card.id}')">
            <div class="giftcard-image">
                ${card.image_url ? `<img src="${card.image_url}" alt="${card.brand}" style="width: 100%; height: 100%; object-fit: cover;">` : '🎁'}
            </div>
            <div class="giftcard-content">
                <div class="giftcard-brand">${card.brand}</div>
                <div class="giftcard-category">${card.category}</div>
                <div class="giftcard-price">${formatCurrency(card.denomination, card.currency)}</div>
                ${card.discount_percentage > 0 ? `
                    <div class="giftcard-discount">${card.discount_percentage}% off</div>
                ` : ''}
                <div class="giftcard-stock">${card.stock_quantity} available</div>
            </div>
        </div>
    `).join('');
}

// Select gift card
async function selectGiftCard(cardId) {
    try {
        const { data, error } = await supabase
            .from('giftcards')
            .select('*')
            .eq('id', cardId)
            .single();

        if (error) throw error;

        selectedGiftCard = data;
        showGiftCardModal();
    } catch (error) {
        console.error('Error loading gift card:', error);
    }
}

// Show gift card modal
function showGiftCardModal() {
    const modal = document.getElementById('giftcard-modal');
    const details = document.getElementById('giftcard-details');
    
    details.innerHTML = `
        <div class="giftcard-details-image">
            ${selectedGiftCard.image_url ? `<img src="${selectedGiftCard.image_url}" alt="${selectedGiftCard.brand}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.5rem;">` : '🎁'}
        </div>
        <div class="giftcard-details-info">
            <h3>${selectedGiftCard.brand}</h3>
            <p><strong>Category:</strong> ${selectedGiftCard.category}</p>
            <p><strong>Denomination:</strong> ${formatCurrency(selectedGiftCard.denomination, selectedGiftCard.currency)}</p>
            ${selectedGiftCard.discount_percentage > 0 ? `
                <p><strong>Discount:</strong> ${selectedGiftCard.discount_percentage}%</p>
            ` : ''}
            <p><strong>Available:</strong> ${selectedGiftCard.stock_quantity} cards</p>
        </div>
    `;
    
    document.getElementById('giftcard-quantity').value = 1;
    updateGiftCardTotal();
    modal.classList.add('active');
}

// Update gift card total
function updateGiftCardTotal() {
    if (!selectedGiftCard) return;
    
    const quantity = parseInt(document.getElementById('giftcard-quantity').value) || 1;
    const price = selectedGiftCard.denomination;
    const discount = selectedGiftCard.discount_percentage || 0;
    const total = price * quantity * (1 - discount / 100);
    
    document.getElementById('giftcard-total').textContent = formatCurrency(total, selectedGiftCard.currency);
}

// Purchase gift card
async function purchaseGiftCard(e) {
    e.preventDefault();
    
    if (!currentWallet || !selectedGiftCard) return;
    
    const quantity = parseInt(document.getElementById('giftcard-quantity').value);
    const price = selectedGiftCard.denomination;
    const discount = selectedGiftCard.discount_percentage || 0;
    const total = price * quantity * (1 - discount / 100);
    
    // Check balance
    if (currentWallet.balance < total) {
        alert('Insufficient balance. Please add funds to your wallet.');
        return;
    }
    
    // Check stock
    if (selectedGiftCard.stock_quantity < quantity) {
        alert('Insufficient stock available.');
        return;
    }
    
    try {
        // Create transaction
        const { data: transactionData, error: transactionError } = await supabase
            .from('transactions')
            .insert({
                user_id: currentUser.id,
                wallet_id: currentWallet.id,
                type: 'giftcard_purchase',
                amount: total,
                currency: selectedGiftCard.currency,
                description: `Purchase of ${quantity}x ${selectedGiftCard.brand} gift card(s)`,
                status: 'completed',
                metadata: {
                    giftcard_id: selectedGiftCard.id,
                    quantity: quantity,
                    unit_price: price,
                    discount: discount
                }
            })
            .select()
            .single();
        
        if (transactionError) throw transactionError;
        
        // Create user gift cards
        const giftCardPromises = [];
        for (let i = 0; i < quantity; i++) {
            const code = generateGiftCardCode();
            giftCardPromises.push(
                supabase.from('user_giftcards').insert({
                    user_id: currentUser.id,
                    giftcard_id: selectedGiftCard.id,
                    transaction_id: transactionData.id,
                    code: code,
                    status: 'active',
                    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                })
            );
        }
        
        await Promise.all(giftCardPromises);
        
        // Update wallet
        await supabase
            .from('wallets')
            .update({ balance: currentWallet.balance - total })
            .eq('id', currentWallet.id);
        
        // Update stock
        await supabase
            .from('giftcards')
            .update({ stock_quantity: selectedGiftCard.stock_quantity - quantity })
            .eq('id', selectedGiftCard.id);
        
        alert(`Successfully purchased ${quantity}x ${selectedGiftCard.brand} gift card(s)!`);
        
        document.getElementById('giftcard-modal').classList.remove('active');
        await loadWalletData();
        await loadTransactions();
        await loadFeaturedGiftCards();
        if (currentView === 'giftcards') {
            await loadAllGiftCards();
        }
    } catch (error) {
        console.error('Error purchasing gift card:', error);
        alert('Failed to purchase gift card. Please try again.');
    }
}

// Generate gift card code
function generateGiftCardCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 16; i++) {
        if (i > 0 && i % 4 === 0) code += '-';
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Load bank details using secure function
async function loadBankDetails() {
    try {
        const { data, error } = await supabase.rpc('get_bank_details_for_deposit');

        if (error) throw error;

        if (!data || data.length === 0) {
            document.getElementById('bank-details').innerHTML = '<p>Bank details not available at the moment. Please try again later.</p>';
            return;
        }

        const bankDetails = data[0];
        document.getElementById('bank-details').innerHTML = `
            <h3 style="margin-bottom: 1rem; font-weight: 600;">Bank Transfer Details</h3>
            <p><strong>Bank Name:</strong> ${bankDetails.bank_name}</p>
            <p><strong>Account Name:</strong> ${bankDetails.account_name}</p>
            <p><strong>Account Number:</strong> ${bankDetails.account_number}</p>
            <p><strong>Account Type:</strong> ${bankDetails.account_type}</p>
            <p style="margin-top: 1rem; font-size: 0.875rem; color: var(--muted-foreground);">
                Please transfer the amount to the above account and submit this form. Your wallet will be credited once we confirm the payment.
            </p>
        `;
    } catch (error) {
        console.error('Error loading bank details:', error);
        document.getElementById('bank-details').innerHTML = '<p>Unable to load bank details. Please try again.</p>';
    }
}

// Generate narration
function generateNarration() {
    const digits = Math.random().toString().slice(2, 14).padEnd(12, '0');
    generatedNarration = digits;
    document.getElementById('narration-key').value = digits;
}

// Copy narration
function copyNarration() {
    const narrationInput = document.getElementById('narration-key');
    narrationInput.select();
    document.execCommand('copy');
    
    const copyBtn = document.getElementById('copy-narration');
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyBtn.textContent = 'Copy';
    }, 2000);
}

// Switch views
function switchView(view) {
    currentView = view;
    
    if (view === 'dashboard') {
        document.getElementById('dashboard-view').classList.add('view-active');
        document.getElementById('dashboard-view').classList.remove('view-hidden');
        document.getElementById('giftcards-view').classList.add('view-hidden');
        document.getElementById('giftcards-view').classList.remove('view-active');
        
        document.getElementById('dashboard-view-btn').classList.remove('btn-secondary');
        document.getElementById('dashboard-view-btn').classList.add('btn-primary');
        document.getElementById('giftcards-view-btn').classList.remove('btn-primary');
        document.getElementById('giftcards-view-btn').classList.add('btn-secondary');
    } else if (view === 'giftcards') {
        document.getElementById('dashboard-view').classList.add('view-hidden');
        document.getElementById('dashboard-view').classList.remove('view-active');
        document.getElementById('giftcards-view').classList.add('view-active');
        document.getElementById('giftcards-view').classList.remove('view-hidden');
        
        document.getElementById('dashboard-view-btn').classList.remove('btn-primary');
        document.getElementById('dashboard-view-btn').classList.add('btn-secondary');
        document.getElementById('giftcards-view-btn').classList.remove('btn-secondary');
        document.getElementById('giftcards-view-btn').classList.add('btn-primary');
        
        loadAllGiftCards();
    }
}

// Submit fund form
async function submitFundForm(e) {
    e.preventDefault();
    
    const amount = document.getElementById('fund-amount').value;
    const method = document.getElementById('deposit-method').value;
    
    if (!amount || !method) return;

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
                    narration: generatedNarration || `Deposit via ${method}`,
                    status: 'pending'
                }
            ]);

        if (error) throw error;

        alert('Deposit request submitted successfully! Your wallet will be credited once payment is confirmed.');
        document.getElementById('fund-modal').classList.remove('active');
        document.getElementById('fund-form').reset();
        document.getElementById('narration-section').style.display = 'none';
        document.getElementById('bank-details').innerHTML = '';
        await loadTransactions();
    } catch (error) {
        console.error('Error submitting deposit:', error);
        alert('Failed to submit deposit request. Please try again.');
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

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    init();

    // Logout
    document.getElementById('logout-btn').addEventListener('click', async function() {
        await supabase.auth.signOut();
        window.location.href = 'landing.html';
    });

    // View toggle
    document.getElementById('dashboard-view-btn').addEventListener('click', () => switchView('dashboard'));
    document.getElementById('giftcards-view-btn').addEventListener('click', () => switchView('giftcards'));
    document.getElementById('view-all-giftcards').addEventListener('click', () => switchView('giftcards'));
    document.getElementById('back-to-dashboard').addEventListener('click', () => switchView('dashboard'));

    // Quick actions
    document.getElementById('fund-wallet-btn').addEventListener('click', function() {
        document.getElementById('fund-modal').classList.add('active');
        generateNarration();
    });

    document.getElementById('quick-add-funds').addEventListener('click', function() {
        document.getElementById('fund-modal').classList.add('active');
        generateNarration();
    });

    document.getElementById('quick-withdraw').addEventListener('click', function() {
        alert('Withdrawal feature coming soon!');
    });

    document.getElementById('quick-giftcards').addEventListener('click', () => switchView('giftcards'));
    document.getElementById('quick-crypto').addEventListener('click', () => alert('Crypto feature coming soon!'));
    document.getElementById('quick-bills').addEventListener('click', () => alert('Bill payment feature coming soon!'));
    document.getElementById('quick-mobile').addEventListener('click', () => alert('Mobile top-up feature coming soon!'));

    document.getElementById('withdraw-btn').addEventListener('click', function() {
        alert('Withdrawal feature coming soon!');
    });

    // Modal close
    document.querySelector('.modal-close').addEventListener('click', function() {
        document.getElementById('fund-modal').classList.remove('active');
        document.getElementById('fund-form').reset();
        document.getElementById('narration-section').style.display = 'none';
        document.getElementById('bank-details').innerHTML = '';
    });

    document.querySelector('.modal-close-giftcard').addEventListener('click', function() {
        document.getElementById('giftcard-modal').classList.remove('active');
    });

    // Click outside modal
    window.addEventListener('click', function(e) {
        const fundModal = document.getElementById('fund-modal');
        const giftcardModal = document.getElementById('giftcard-modal');
        
        if (e.target === fundModal) {
            fundModal.classList.remove('active');
            document.getElementById('fund-form').reset();
            document.getElementById('narration-section').style.display = 'none';
            document.getElementById('bank-details').innerHTML = '';
        }
        
        if (e.target === giftcardModal) {
            giftcardModal.classList.remove('active');
        }
    });

    // Deposit method change
    document.getElementById('deposit-method').addEventListener('change', async function() {
        const narrationSection = document.getElementById('narration-section');
        
        if (this.value === 'bank_transfer' || this.value === 'bank_deposit') {
            narrationSection.style.display = 'block';
            generateNarration();
            await loadBankDetails();
        } else {
            narrationSection.style.display = 'none';
            document.getElementById('bank-details').innerHTML = '';
        }
    });

    // Copy narration
    document.getElementById('copy-narration').addEventListener('click', copyNarration);
    document.getElementById('narration-key').addEventListener('click', copyNarration);

    // Forms
    document.getElementById('fund-form').addEventListener('submit', submitFundForm);
    document.getElementById('giftcard-purchase-form').addEventListener('submit', purchaseGiftCard);
    document.getElementById('giftcard-quantity').addEventListener('input', updateGiftCardTotal);
});
