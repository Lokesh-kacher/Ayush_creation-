/**
 * AYUSH CREATION — Admin Panel Core JavaScript & Security Guards
 */

// Determine API Base URL
const isLocal =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.protocol === 'file:';

const API_BASE =
  localStorage.getItem('AYUSH_API_URL') ||
  (isLocal ? 'http://localhost:5000/api/v1' : 'https://ayush-creation-backend.onrender.com/api/v1');

/**
 * Toast Notification System
 */
function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/**
 * Admin API Request Client with Bearer Token & 401 Redirect
 */
async function adminFetch(endpoint, options = {}) {
  const token = localStorage.getItem('admin_token');
  const isLoginPage = window.location.pathname.endsWith('login.html');

  if (!token && !isLoginPage) {
    window.location.href = 'login.html';
    return;
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401 && !isLoginPage) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = 'login.html';
      return;
    }

    if (!res.ok) {
      const err = new Error(data.message || `Request failed (${res.status})`);
      err.errors = data.errors || [];
      throw err;
    }

    return data;
  } catch (err) {
    console.error(`[Admin API Error] ${endpoint}:`, err);
    throw err;
  }
}

/**
 * Global Admin Auth Guard & UI Setup
 */
document.addEventListener('DOMContentLoaded', async () => {
  const isLoginPage = window.location.pathname.endsWith('login.html');
  if (isLoginPage) return;

  const token = localStorage.getItem('admin_token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Populate admin profile info if available
  const storedUser = localStorage.getItem('admin_user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      const nameEl = document.getElementById('adminUserName');
      if (nameEl) nameEl.textContent = user.name || 'Admin';
    } catch (e) {}
  }

  // Highlight active sidebar navigation item
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Attach logout handler
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await adminFetch('/auth/logout', { method: 'POST' });
      } catch (err) {
        // proceed anyway
      }
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = 'login.html';
    });
  }
});

/**
 * Modal Helpers
 */
function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.add('active');
}

function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.remove('active');
}

/**
 * Status Badge Formatter
 */
function getStatusBadge(status) {
  const map = {
    new: '<span class="badge badge-new">New</span>',
    contacted: '<span class="badge badge-contacted">Contacted</span>',
    qualified: '<span class="badge badge-qualified">Qualified</span>',
    'quotation-sent': '<span class="badge badge-quotation-sent">Quote Sent</span>',
    'follow-up': '<span class="badge badge-contacted">Follow Up</span>',
    converted: '<span class="badge badge-converted">Converted</span>',
    closed: '<span class="badge badge-closed">Closed</span>',
    published: '<span class="badge badge-published">Published</span>',
    draft: '<span class="badge badge-draft">Draft</span>'
  };
  return map[status] || `<span class="badge badge-draft">${status}</span>`;
}

/**
 * Date Formatter
 */
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
