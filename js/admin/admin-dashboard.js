document.addEventListener('DOMContentLoaded', async () => {
    const auth = new window.AdminAuth();
    const loading = document.getElementById('dashboardLoading');
    const content = document.getElementById('dashboardContent');
    const adminName = document.getElementById('adminName');
    const adminRole = document.getElementById('adminRole');
    const adminInitial = document.getElementById('adminInitial');
    const logoutBtn = document.getElementById('logoutBtn');

    const redirectToLogin = () => {
        window.location.href = 'login.html';
    };

    if (!loading || !content) return;

    auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') redirectToLogin();
    });

    const result = await auth.checkSession();

    if (!result || !result.success || !result.authenticated) {
        await auth.clearSession();
        redirectToLogin();
        return;
    }

    const user = result.user || {};
    const displayName = user.nama || 'Admin';
    const role = user.role || 'admin';

    if (adminName) adminName.textContent = displayName;
    if (adminRole) adminRole.textContent = role;
    if (adminInitial) adminInitial.textContent = displayName.charAt(0).toUpperCase();

    loading.style.display = 'none';
    content.style.display = 'block';

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await auth.logout();
            } catch (error) {
                // ignore and continue redirect
            }
            redirectToLogin();
        });
    }
});
