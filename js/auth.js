/**
 * auth.js
 * Vanilla replacement for src/context/AuthContext.js.
 * React Context + useState/useEffect is replaced with a plain module that
 * reads/writes localStorage directly (the same storage the original
 * AuthProvider used under the hood), plus a tiny pub/sub so the navbar can
 * re-render when login()/logout() are called.
 *
 * jwt-decode is replaced with a minimal manual base64url JWT payload decoder
 * (decodeJwt) used only to validate that the stored token is well-formed;
 * this is the closest vanilla-JS equivalent of the original library call.
 */
const Auth = (() => {
  let listeners = [];

  function getUser() {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }

  function getToken() {
    return localStorage.getItem('token');
  }

  function decodeJwt(token) {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token');
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(payload + '=='.slice(0, (4 - (payload.length % 4)) % 4));
    return JSON.parse(decoded);
  }

  function login(userData, jwtToken) {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    notify();
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    notify();
  }

  function onChange(cb) {
    listeners.push(cb);
  }

  function notify() {
    listeners.forEach((cb) => cb());
  }

  // Mirror the original AuthProvider's mount-time effect: if a token exists,
  // verify it decodes, otherwise log out.
  (function init() {
    const token = getToken();
    if (token) {
      try {
        decodeJwt(token);
      } catch (e) {
        logout();
      }
    }
  })();

  return { getUser, getToken, login, logout, onChange };
})();
