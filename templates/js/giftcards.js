// Gift Cards JavaScript

const SUPABASE_URL = 'https://dsljcorhhnushvbvsrmh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbGpjb3JoaG51c2h2YnZzcm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTA1NzksImV4cCI6MjA3MzYyNjU3OX0.-ilw64YADRBXVW3KPKNUxCOEZepXYnL1L-lsj3C4-_E';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let currentWallet = null;
let selectedGiftCard = null;

// Initialize
async function initGiftCards() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        window.location.href = 'auth.html';
        return;
    }

    currentUser = session.user;
    await loadWallet();
    await loadAllGiftCards();
}

// Load wallet
async function loadWallet() {
    const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

    if (error) {
        console.error('Error loading wallet:', error);
        return;
    }

    currentWallet = data;
}

// Load all gift cards
async function loadAllGiftCards() {
    const { data, error } = await supabase
        .from('giftcards')
        .select('*')
        .eq('is_active', true)
        .order('brand');

    if (error) {
        console.error('Error loading gift cards:', error);
        return;
    }

    displayGiftCards(data);
}

// Display gift cards
function displayGiftCards(giftCards) {
    const container = document.getElementById('giftcards-container');
    
    if (giftCards.length === 0) {
        container.innerHTML = '<p class="loading">No gift cards available</p>';
        return;
    }

    container.innerHTML = giftCards.map(card => `
        <div class="giftcard-item" onclick="selectGiftCard('${card.id}')">
            <div class="giftcard-image">
                ${card.image_url ? `<img src="${card.image_url}" alt="${card.brand}">` : '🎁'}
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
    const { data, error } = await supabase
        .from('giftcards')
        .select('*')
        .eq('id', cardId)
        .single();

    if (error) {
        console.error('Error loading gift card:', error);
        return;
    }

    selectedGiftCard = data;
    showPurchaseModal();
}

// Show purchase modal
function showPurchaseModal() {
    const modal = document.getElementById('giftcard-modal');
    const details = document.getElementById('giftcard-details');
    
    details.innerHTML = `
        <div class="giftcard-details-image">
            ${selectedGiftCard.image_url ? `<img src="${selectedGiftCard.image_url}" alt="${selectedGiftCard.brand}">` : '🎁'}
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
    
    updateTotal();
    modal.classList.add('active');
}

// Update total
function updateTotal() {
    const quantity = parseInt(document.getElementById('giftcard-quantity').value) || 1;
    const price = selectedGiftCard.denomination;
    const discount = selectedGiftCard.discount_percentage || 0;
    const total = price * quantity * (1 - discount / 100);
    
    document.getElementById('giftcard-total').textContent = formatCurrency(total, selectedGiftCard.currency);
}

// Purchase gift card
async function purchaseGiftCard(e) {
    e.preventDefault();
    
    const quantity = parseInt(document.getElementById('giftcard-quantity').value);
    
    if (!currentWallet || !selectedGiftCard) return;
    
    const price = selectedGiftCard.denomination;
    const discount = selectedGiftCard.discount_percentage || 0;
    const total = price * quantity * (1 - discount / 100);
    
    // Check if user has sufficient balance
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
        
        // Create user gift card entries
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
                    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
                })
            );
        }
        
        await Promise.all(giftCardPromises);
        
        // Update wallet balance
        const { error: walletError } = await supabase
            .from('wallets')
            .update({ balance: currentWallet.balance - total })
            .eq('id', currentWallet.id);
        
        if (walletError) throw walletError;
        
        // Update stock
        const { error: stockError } = await supabase
            .from('giftcards')
            .update({ stock_quantity: selectedGiftCard.stock_quantity - quantity })
            .eq('id', selectedGiftCard.id);
        
        if (stockError) throw stockError;
        
        alert(`Successfully purchased ${quantity}x ${selectedGiftCard.brand} gift card(s)!`);
        
        // Close modal and refresh
        document.getElementById('giftcard-modal').classList.remove('active');
        await loadAllGiftCards();
        await loadWallet();
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

// Utility function
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    initGiftCards();
    
    // Quantity change
    const quantityInput = document.getElementById('giftcard-quantity');
    if (quantityInput) {
        quantityInput.addEventListener('input', updateTotal);
    }
    
    // Purchase form
    const purchaseForm = document.getElementById('giftcard-purchase-form');
    if (purchaseForm) {
        purchaseForm.addEventListener('submit', purchaseGiftCard);
    }
    
    // Close modal
    const closeBtn = document.querySelector('.modal-close-giftcard');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            document.getElementById('giftcard-modal').classList.remove('active');
        });
    }
    
    // Click outside modal to close
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('giftcard-modal');
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});
