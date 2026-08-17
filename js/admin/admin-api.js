(function () {
    const defaultConfig = window.ADIBA_CONFIG || {
        API_URL: 'MASUKKAN_URL_GAS_DI_SINI'
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
        const baseUrl = window.getAdibaApiUrl ? window.getAdibaApiUrl() : (defaultConfig.API_URL || 'MASUKKAN_URL_GAS_DI_SINI');

        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        return handleApiResponse(response, 'Gagal memproses permintaan.');
    }

    function handleApiError(error, onExpiredSession) {
        const message = error && error.message ? error.message : 'Terjadi kesalahan.';

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
