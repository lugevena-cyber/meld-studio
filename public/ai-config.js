window.MELD_AI_CONFIG = {
  // Connection settings only. Keep model API keys in the local server's .env file.
  apiBase: ['127.0.0.1','localhost'].includes(location.hostname) && location.port === '4173' ? 'http://127.0.0.1:4180' : '',
};
