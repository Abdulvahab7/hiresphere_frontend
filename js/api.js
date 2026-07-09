const API_BASE_URL = 'https://hiresphere-backend-stvr.onrender.com/api';

const api = {
  async _request(method, path, body) {
    const token = localStorage.getItem('token');
    const headers = {};
    let fetchBody;

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      fetchBody = JSON.stringify(body);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response;
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: fetchBody,
      });
    } catch (networkErr) {
      // Network-level failure (server down, CORS, etc.)
      const err = new Error('Network error');
      err.response = null;
      throw err;
    }

    const contentType = response.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    } else {
      data = await response.text().catch(() => null);
    }

    if (!response.ok) {
      const err = new Error(`Request failed with status ${response.status}`);
      err.response = { status: response.status, data };
      throw err;
    }

    return { data, status: response.status };
  },

  get(path) {
    return this._request('GET', path);
  },
  post(path, body) {
    return this._request('POST', path, body);
  },
  put(path, body) {
    return this._request('PUT', path, body);
  },
  delete(path) {
    return this._request('DELETE', path);
  },
};
