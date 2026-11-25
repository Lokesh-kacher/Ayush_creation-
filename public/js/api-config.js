/**
 * AYUSH CREATION — Central API Configuration & Network Client
 */
(function () {
  'use strict';

  // Determine API Base URL
  // If testing locally (localhost / 127.0.0.1) -> use local backend port 5000
  // In production -> connect to Render Backend
  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:';

  const DEFAULT_PROD_API = 'https://ayush-creation-backend.onrender.com/api/v1';
  const DEFAULT_LOCAL_API = 'http://localhost:5000/api/v1';

  const customApiOverride = localStorage.getItem('AYUSH_API_URL');
  const API_BASE_URL =
    customApiOverride || (isLocal ? DEFAULT_LOCAL_API : DEFAULT_PROD_API);

  /**
   * Central API Client wrapper
   */
  async function apiFetch(endpoint, options = {}) {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const headers = { ...options.headers };

    // Attach admin JWT token if present
    const token = localStorage.getItem('admin_token');
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Do not set Content-Type if sending FormData (browser auto sets multipart boundary)
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers,
      credentials: 'include' // include cookies for cross-origin JWT where supported
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.errors = data.errors || [];
        throw error;
      }

      return data;
    } catch (err) {
      console.warn(`[Ayush API] Request to ${url} failed:`, err.message);
      throw err;
    }
  }

  // Expose globally
  window.AYUSH_CONFIG = {
    API_BASE_URL,
    apiFetch,
    isLocal
  };
})();
