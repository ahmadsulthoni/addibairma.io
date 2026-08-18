window.ADIBA_CONFIG = window.ADIBA_CONFIG || {
    API_URL: 'https://script.google.com/macros/s/AKfycbyFR8GGpzN6YUTavvwK4Tm9gcOZPW0Yt1Vph8dS8PgsbwqUG7nBetOZ0irKQ-NgScuQbg/exec'
};

window.getAdibaApiUrl = function getAdibaApiUrl(action = '') {
    const baseUrl = (window.ADIBA_CONFIG && window.ADIBA_CONFIG.API_URL) || 'https://script.google.com/macros/s/AKfycbyFR8GGpzN6YUTavvwK4Tm9gcOZPW0Yt1Vph8dS8PgsbwqUG7nBetOZ0irKQ-NgScuQbg/exec';

    if (!action) {
        return baseUrl;
    }

    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}action=${encodeURIComponent(action)}`;
};
