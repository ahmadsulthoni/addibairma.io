window.ADIBA_CONFIG = window.ADIBA_CONFIG || {
    API_URL: 'https://script.google.com/macros/s/AKfycbyFR8GGpzN6YUTavvwK4Tm9gcOZPW0Yt1Vph8dS8PgsbwqUG7nBetOZ0irKQ-NgScuQbg/exec',
    SUPABASE_URL: 'https://aeoijayqauscjczkoutu.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_qaBA555GBHFKstcPYSUtGw_57c3Ej3l'
};

window.getAdibaApiUrl = function getAdibaApiUrl(action = '') {
    const baseUrl = (window.ADIBA_CONFIG && window.ADIBA_CONFIG.API_URL) || 'https://script.google.com/macros/s/AKfycbyFR8GGpzN6YUTavvwK4Tm9gcOZPW0Yt1Vph8dS8PgsbwqUG7nBetOZ0irKQ-NgScuQbg/exec';

    if (!action) {
        return baseUrl;
    }

    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}action=${encodeURIComponent(action)}`;
};
