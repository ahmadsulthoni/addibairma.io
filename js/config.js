window.ADIBA_CONFIG = window.ADIBA_CONFIG || {
    API_URL: 'https://script.google.com/macros/s/AKfycbxDqsxfuhGpGYI9EjlLnn9mkprcoCbeuoTQfJKhs3T0jQZ6RSmlnKq2WCdG4O7xHnV7DQ/exec'
};

window.getAdibaApiUrl = function getAdibaApiUrl() {
    return (window.ADIBA_CONFIG && window.ADIBA_CONFIG.API_URL) || 'https://script.google.com/macros/s/AKfycbxDqsxfuhGpGYI9EjlLnn9mkprcoCbeuoTQfJKhs3T0jQZ6RSmlnKq2WCdG4O7xHnV7DQ/exec';
};
