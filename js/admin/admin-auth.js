(function () {
    class AdminAuth {
        constructor(storage = window.sessionStorage) {
            this.storage = storage;
            this.storageKey = 'adiba_admin_session';
        }

        getSession() {
            try {
                const raw = this.storage.getItem(this.storageKey);
                return raw ? JSON.parse(raw) : null;
            } catch (error) {
                return null;
            }
        }

        setSession(data) {
            this.storage.setItem(this.storageKey, JSON.stringify(data));
        }

        clearSession() {
            this.storage.removeItem(this.storageKey);
        }

        getToken() {
            const session = this.getSession();
            return session && session.token ? session.token : null;
        }

        getUser() {
            const session = this.getSession();
            return session && session.user ? session.user : null;
        }

        isAuthenticated() {
            return Boolean(this.getToken());
        }

        async login(username, password) {
            const payload = {
                action: 'login',
                username,
                password
            };

            const result = await window.AdminApi.apiPost(payload);

            if (!result || !result.success || !result.token) {
                throw new Error(result && result.message ? result.message : 'Login gagal.');
            }

            const session = {
                token: result.token,
                user: result.user || null
            };

            this.setSession(session);
            return result;
        }

        async logout() {
            const token = this.getToken();

            if (!token) {
                this.clearSession();
                return { success: true, message: 'Logout berhasil.' };
            }

            try {
                const result = await window.AdminApi.apiPost({
                    action: 'logout',
                    token
                });

                this.clearSession();
                return result;
            } catch (error) {
                this.clearSession();
                return {
                    success: true,
                    message: 'Logout berhasil.'
                };
            }
        }

        async checkSession() {
            const token = this.getToken();

            if (!token) {
                this.clearSession();
                return {
                    success: false,
                    authenticated: false,
                    message: 'Session tidak ditemukan.'
                };
            }

            try {
                const result = await window.AdminApi.apiPost({
                    action: 'checkSession',
                    token
                });

                if (!result || !result.success || !result.authenticated) {
                    this.clearSession();
                    return {
                        success: false,
                        authenticated: false,
                        message: 'Session tidak valid.'
                    };
                }

                this.setSession({
                    token,
                    user: result.user || this.getUser()
                });

                return result;
            } catch (error) {
                this.clearSession();
                return {
                    success: false,
                    authenticated: false,
                    message: 'Session tidak valid.'
                };
            }
        }
    }

    window.AdminAuth = AdminAuth;
})();
