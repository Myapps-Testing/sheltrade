// Authentication JavaScript

const SUPABASE_URL = 'https://dsljcorhhnushvbvsrmh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbGpjb3JoaG51c2h2YnZzcm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTA1NzksImV4cCI6MjA3MzYyNjU3OX0.-ilw64YADRBXVW3KPKNUxCOEZepXYnL1L-lsj3C4-_E';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if user is already logged in
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        window.location.href = 'dashboard.html';
    }
}

// Tab switching
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();

    const tabs = document.querySelectorAll('.auth-tab');
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const tabName = this.dataset.tab;
            if (tabName === 'signin') {
                signinForm.classList.remove('hidden');
                signupForm.classList.add('hidden');
            } else {
                signinForm.classList.add('hidden');
                signupForm.classList.remove('hidden');
            }
        });
    });

    // Sign in form handler
    signinForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;
        const errorDiv = document.getElementById('signin-error');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                errorDiv.textContent = error.message;
            } else {
                window.location.href = 'dashboard.html';
            }
        } catch (error) {
            errorDiv.textContent = 'An error occurred. Please try again.';
        }
    });

    // Sign up form handler
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm').value;
        const errorDiv = document.getElementById('signup-error');

        if (password !== confirmPassword) {
            errorDiv.textContent = 'Passwords do not match';
            return;
        }

        if (password.length < 6) {
            errorDiv.textContent = 'Password must be at least 6 characters';
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    emailRedirectTo: window.location.origin + '/dashboard.html'
                }
            });

            if (error) {
                errorDiv.textContent = error.message;
            } else {
                alert('Account created successfully! Please check your email to verify your account.');
                // Switch to sign in tab
                document.querySelector('[data-tab="signin"]').click();
            }
        } catch (error) {
            errorDiv.textContent = 'An error occurred. Please try again.';
        }
    });
});
