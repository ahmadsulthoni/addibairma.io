document.addEventListener('DOMContentLoaded', () => {
    const auth = new window.AdminAuth();
    const form = document.getElementById('adminLoginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('togglePassword');
    const submitButton = document.getElementById('loginSubmit');
    const alertBox = document.getElementById('loginAlert');

    if (!form) return;

    const setAlert = (message, type = 'danger') => {
        if (!alertBox) return;
        alertBox.className = `alert alert-${type} mt-3`;
        alertBox.textContent = message;
        alertBox.hidden = !message;
    };

    const setLoading = (isLoading) => {
        if (!submitButton) return;
        submitButton.disabled = isLoading;
        submitButton.textContent = isLoading ? 'Login...' : 'LOGIN';
    };

    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            passwordToggle.textContent = isPassword ? 'Sembunyikan' : 'Tampilkan';
        });
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = (usernameInput ? usernameInput.value : '').trim();
        const password = (passwordInput ? passwordInput.value : '').trim();

        if (!username || !password) {
            setAlert('Username dan password wajib diisi.', 'danger');
            return;
        }

        setLoading(true);
        setAlert('');

        try {
            await auth.login(username, password);
            window.location.href = 'dashboard.html';
        } catch (error) {
            const message = window.AdminApi.handleApiError(error, () => {
                auth.clearSession();
            });
            setAlert(message || 'Login gagal. Periksa username dan password Anda.', 'danger');
        } finally {
            setLoading(false);
        }
    });
});
