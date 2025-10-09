// Global function to update navigation based on login state
async function updateNavigationForLoginState() {
    // Check both localStorage and sessionStorage for user data
    let userData = sessionStorage.getItem('iyna_user') || localStorage.getItem('iyna_user');
    const loginNavItem = document.getElementById('login-nav-item');
    const signupNavItem = document.getElementById('signup-nav-item');
    const userProfileNav = document.getElementById('user-profile-nav');
    const dashboardNavItem = document.getElementById('dashboard-nav-item');
    const dashboardLink = document.getElementById('dashboard-link');
    const usernameDisplay = document.getElementById('username-display');
    
    console.log('Checking login state...');
    console.log('User data:', userData);
    console.log('Login nav item:', loginNavItem);
    console.log('User profile nav:', userProfileNav);
    
    if (userData) {
        // User is logged in
        const user = JSON.parse(userData);
        const username = user.first_name || user.name || 'User';
        
        console.log('User is logged in:', username, 'Role:', user.role);
        
        // Check for role updates from database
        try {
            if (window.db && user.email) {
                console.log('Checking for role updates...');
                const freshUser = await window.db.getUserByEmail(user.email);
                
                if (freshUser && freshUser.role !== user.role) {
                    console.log('Role change detected:', user.role, '->', freshUser.role);
                    
                    // Update session storage with fresh data
                    sessionStorage.setItem('iyna_user', JSON.stringify(freshUser));
                    localStorage.setItem('iyna_user', JSON.stringify(freshUser));
                    
                    // Update user variable with fresh data
                    user.role = freshUser.role;
                    user.first_name = freshUser.first_name;
                    user.last_name = freshUser.last_name;
                    
                    console.log('Session updated with new role:', freshUser.role);
                }
            }
        } catch (error) {
            console.error('Error checking for role updates:', error);
        }
        
        // Hide login/signup buttons
        if (loginNavItem) loginNavItem.style.display = 'none';
        if (signupNavItem) signupNavItem.style.display = 'none';
        
        // Show user profile
        if (userProfileNav) userProfileNav.style.display = 'block';
        if (dashboardNavItem) dashboardNavItem.style.display = 'block';
        if (dashboardLink) {
            const role = user.role || '';
            if (role === 'chapter_lead') {
                dashboardLink.href = 'chapter_lead_dash.html';
            } else if (role === 'deputy_chapter_lead' || role === 'regional_lead' || role === 'admin') {
                dashboardLink.href = 'chapter_team_dash.html';
            } else if (role === 'chapter-lead' || role === 'chapter_director') {
                dashboardLink.href = 'chapter_director_dash.html';
            } else {
                dashboardLink.href = 'personal_dash.html';
            }
        }
        if (usernameDisplay) usernameDisplay.textContent = username;
    } else {
        console.log('User is not logged in');
        // User is not logged in
        // Show login/signup buttons
        if (loginNavItem) loginNavItem.style.display = 'block';
        if (signupNavItem) signupNavItem.style.display = 'block';
        
        // Hide user profile
        if (userProfileNav) userProfileNav.style.display = 'none';
        if (dashboardNavItem) dashboardNavItem.style.display = 'none';
        if (dashboardLink) dashboardLink.href = 'personal_dash.html';
    }
}

// Listen for storage changes (when user logs in/out on other pages)
window.addEventListener('storage', function(e) {
    if (e.key === 'iyna_user') {
        updateNavigationForLoginState();
    }
});

// Also check for role updates periodically
setInterval(async () => {
    try {
        await updateNavigationForLoginState();
    } catch (error) {
        console.error('Error in periodic role check:', error);
    }
}, 5000); // Check every 5 seconds 