// Load shared navigation bar with persistent authentication awareness
document.addEventListener('DOMContentLoaded', function() {
    // Find the navigation placeholder
    const navPlaceholder = document.getElementById('nav-placeholder');
    
    if (navPlaceholder) {
        // Load the navigation content
        fetch('nav.html')
            .then(response => response.text())
            .then(data => {
                navPlaceholder.innerHTML = data;
                
                // After navigation is loaded, check authentication status multiple times
                // to ensure it works reliably
                setTimeout(() => checkAndUpdateNavAuth(), 500);
                setTimeout(() => checkAndUpdateNavAuth(), 1500);
                setTimeout(() => checkAndUpdateNavAuth(), 3000);
            })
            .catch(error => {
                console.error('Error loading navigation:', error);
            });
    }
});

// Global flag to prevent multiple updates
let navAuthUpdated = false;

// Function to check authentication and update navigation
async function checkAndUpdateNavAuth() {
    try {
        // Don't run if already successfully updated
        if (navAuthUpdated) return;
        
        console.log('Checking navigation authentication...');

        // Wait for database to be ready
        let attempts = 0;
        while (!window.db && attempts < 100) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (!window.db) {
            console.log('Database not available for nav auth check, will retry...');
            // Retry after a delay
            setTimeout(() => checkAndUpdateNavAuth(), 2000);
            return;
        }

        // Check if user is logged in by looking for user data in sessionStorage
        // This is how the custom auth system works
        const userData = sessionStorage.getItem('iyna_user');
        
        if (!userData) {
            console.log('No user data found in session - keeping default nav');
            return;
        }

        try {
            const user = JSON.parse(userData);
            
            if (user && user.is_active !== false) {
                console.log('User authenticated for nav:', user.first_name, user.role);
                
                // User is logged in - update navigation
                updateNavForLoggedInUser(user);
                
                // Mark as successfully updated
                navAuthUpdated = true;
                
                // Set up auth state listener (only once)
                setupAuthStateListener();
            } else {
                console.log('User data invalid or inactive');
                sessionStorage.removeItem('iyna_user');
            }
        } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            sessionStorage.removeItem('iyna_user');
        }
        
    } catch (error) {
        console.error('Error checking auth status for nav:', error);
        // Retry on error
        setTimeout(() => checkAndUpdateNavAuth(), 2000);
    }
}

// Function to update navigation for logged-in users
function updateNavForLoggedInUser(user) {
    const loginSignupNav = document.querySelector('.login-signup-nav');
    
    if (!loginSignupNav) {
        console.log('Nav not ready yet, retrying...');
        // Navigation might not be fully loaded yet, retry
        setTimeout(() => updateNavForLoggedInUser(user), 500);
        return;
    }

    console.log('Updating nav for:', user.first_name);
    
    // Replace login/signup section with user menu (keeping your preferred emojis!)
    loginSignupNav.innerHTML = `
        <li class="nav-item mx-1 dropdown">
            <a class="nav-link text-dark fw-semibold dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                ${user.first_name} ${user.last_name}&nbsp;&rsaquo;
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown" style="background-color: white; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); min-width: 200px; padding: 8px 0;">
                <li>
                    <a class="dropdown-item" href="${getDashboardUrl(user.role)}" style="padding: 12px 20px; color: #1B4965; font-weight: 600; font-size: 1rem;">
                        ▸ Dashboard
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="account.html" style="padding: 12px 20px; color: #1B4965; font-weight: 600; font-size: 1rem;">
                        ▸ View Profile
                    </a>
                </li>
                <li><hr class="dropdown-divider" style="margin: 8px 0; border-color: #e0e0e0;"></li>
                <li>
                    <a class="dropdown-item" href="#" onclick="logoutUser(); return false;" style="padding: 12px 20px; color: #dc3545; font-weight: 600; font-size: 1rem;">
                        ↪ Logout
                    </a>
                </li>
            </ul>
        </li>
    `;
}

// Function to get dashboard URL based on user role
function getDashboardUrl(role) {
            switch (role) {
            case 'chapter_lead':
                return 'chapter_lead_dash.html';
            case 'admin':
                return 'chapter_team_dash.html';
            case 'chapter_director':
                return 'chapter_director_dash.html';
            case 'member':
            default:
                return 'personal_dash.html';
        }
}

// Function to handle logout
async function logoutUser() {
    try {
        console.log('Logging out user...');
        
        // Reset the flag so nav can be updated again
        navAuthUpdated = false;
        
        // Clear user data from sessionStorage
        sessionStorage.removeItem('iyna_user');
        
        // Redirect to login page
        window.location.href = 'login.html';
        
    } catch (error) {
        console.error('Logout error:', error);
        // Force redirect even if logout fails
        window.location.href = 'login.html';
    }
}

// Global listener flag to prevent multiple setups
let authListenerSetup = false;

// Function to set up authentication state listener
function setupAuthStateListener() {
    if (authListenerSetup) return;
    
    console.log('Setting up auth listener for nav');
    authListenerSetup = true;
    
    // Listen for storage changes (when user logs in/out on other pages)
    window.addEventListener('storage', function(e) {
        if (e.key === 'iyna_user') {
            console.log('User data changed in storage');
            navAuthUpdated = false;
            setTimeout(() => {
                checkAndUpdateNavAuth();
            }, 500);
        }
    });
}

// Make logout function globally available
window.logoutUser = logoutUser;

// Also check when page becomes visible (if user switches tabs)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && !navAuthUpdated) {
        console.log('Page visible, checking nav auth...');
        setTimeout(() => checkAndUpdateNavAuth(), 500);
    }
});

// Fallback check every 10 seconds if not yet updated
setInterval(() => {
    if (!navAuthUpdated) {
        checkAndUpdateNavAuth();
    }
}, 10000);