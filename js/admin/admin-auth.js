(function () {
    class AdminAuth {
        constructor(storage = window.sessionStorage) {
            this.storage = storage;
            this.messageKey = 'adiba_admin_message';
        }

        getSession() {
            const client = this.getClient();
            return client ? client.auth.getSession() : Promise.resolve({ data: { session: null } });
        }

        getClient() {
            return window.initSupabase ? window.initSupabase() : null;
        }

        onAuthStateChange(callback) {
            const client = this.getClient();
            return client ? client.auth.onAuthStateChange(callback) : { data: { subscription: { unsubscribe() {} } } };
        }

        async clearSession() {
            const client = this.getClient();
            if (client) await client.auth.signOut();
        }

        setMessage(message) {
            this.storage.setItem(this.messageKey, message);
        }

        consumeMessage() {
            const message = this.storage.getItem(this.messageKey);
            this.storage.removeItem(this.messageKey);
            return message;
        }

        async login(email, password) {
            const client = this.getClient();
            if (!client) throw new Error('Supabase belum dikonfigurasi.');

            const { data, error } = await client.auth.signInWithPassword({ email, password });
            if (error) throw error;

            const profile = await this.getAdminProfile(data.user.id);
            if (!profile) {
                await client.auth.signOut();
                this.setMessage('Anda tidak memiliki akses sebagai administrator.');
                throw new Error('Anda tidak memiliki akses sebagai administrator.');
            }

            return { user: data.user, profile };
        }

        async getAdminProfile(userId) {
            const client = this.getClient();
            const { data, error } = await client
                .from('profiles')
                .select('id, nama, role')
                .eq('id', userId)
                .eq('role', 'admin')
                .maybeSingle();

            if (error) throw error;
            return data;
        }

        async logout() {
            await this.clearSession();
            return { success: true, message: 'Logout berhasil.' };
        }

        async checkSession() {
            const client = this.getClient();
            if (!client) return { success: false, authenticated: false, message: 'Supabase belum dikonfigurasi.' };

            const { data: sessionData, error } = await client.auth.getSession();
            if (error || !sessionData.session) {
                return { success: false, authenticated: false, message: 'Session tidak ditemukan.' };
            }

            const profile = await this.getAdminProfile(sessionData.session.user.id);
            if (!profile) {
                await client.auth.signOut();
                this.setMessage('Anda tidak memiliki akses sebagai administrator.');
                return { success: false, authenticated: false, message: 'Akses administrator ditolak.' };
            }

            return { success: true, authenticated: true, user: profile, session: sessionData.session };
        }
    }

    window.AdminAuth = AdminAuth;
})();
