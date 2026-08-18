(function () {
    const defaultConfig = window.ADIBA_CONFIG || {
        API_URL: 'https://script.google.com/macros/s/AKfycbyFR8GGpzN6YUTavvwK4Tm9gcOZPW0Yt1Vph8dS8PgsbwqUG7nBetOZ0irKQ-NgScuQbg/exec'
    };

    async function handleApiResponse(response, defaultErrorMessage) {
        const contentType = response.headers.get('content-type') || '';
        let payload = null;

        try {
            payload = contentType.includes('application/json') ? await response.json() : await response.text();
        } catch (error) {
            payload = null;
        }

        if (!response.ok) {
            const errorText = typeof payload === 'string' && payload ? payload : defaultErrorMessage;
            throw new Error(errorText || defaultErrorMessage || 'Terjadi kesalahan saat memproses permintaan.');
        }

        if (payload && typeof payload === 'object' && payload.success === false) {
            const message = payload.message || defaultErrorMessage || 'Permintaan gagal.';
            throw new Error(message);
        }

        return payload;
    }

    async function apiGet(action, params = {}) {
        const baseUrl = window.getAdibaApiUrl ? window.getAdibaApiUrl() : (defaultConfig.API_URL || 'MASUKKAN_URL_GAS_DI_SINI');
        const query = new URLSearchParams({ action, ...params });

        const response = await fetch(`${baseUrl}?${query.toString()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        return handleApiResponse(response, 'Gagal mengambil data dari server.');
    }

    async function apiPost(payload) {
        const action = payload && payload.action ? payload.action : '';
        const baseUrl = window.getAdibaApiUrl ? window.getAdibaApiUrl(action) : (defaultConfig.API_URL || 'MASUKKAN_URL_GAS_DI_SINI');

        try {
            const response = await fetch(baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            return handleApiResponse(response, 'Gagal memproses permintaan.');
        } catch (error) {
            const message = error && error.message ? error.message : 'Terjadi kesalahan.';

            if (message.toLowerCase().includes('failed to fetch') || message.toLowerCase().includes('networkerror') || message.toLowerCase().includes('cors')) {
                throw new Error('Tidak dapat terhubung ke server login. Periksa URL API, izin CORS, dan status deployment backend.');
            }

            throw error;
        }
    }

    function handleApiError(error, onExpiredSession) {
        const message = error && error.message ? error.message : 'Terjadi kesalahan.';

        if (message.toLowerCase().includes('failed to fetch') || message.toLowerCase().includes('networkerror') || message.toLowerCase().includes('cors')) {
            return 'Tidak dapat terhubung ke server login. Periksa URL API, izin CORS, dan status deployment backend.';
        }

        if (message.toLowerCase().includes('token') || message.toLowerCase().includes('session') || message.toLowerCase().includes('expired')) {
            if (typeof onExpiredSession === 'function') {
                onExpiredSession();
            }
            return 'Sesi admin telah berakhir. Silakan login kembali.';
        }

        return message;
    }

    window.AdminApi = {
        apiGet,
        apiPost,
        handleApiError,
        defaultConfig
    };
})();
