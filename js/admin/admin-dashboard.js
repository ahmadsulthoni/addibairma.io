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

    const result = await auth.checkSession();

    if (!result || !result.success || !result.authenticated) {
        auth.clearSession();
        redirectToLogin();
        return;
    }

    const user = result.user || auth.getUser();
    const displayName = user && user.nama ? user.nama : 'Admin';
    const role = user && user.role ? user.role : 'admin';

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
