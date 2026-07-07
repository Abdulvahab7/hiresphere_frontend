/**
 * router.js
 * Vanilla replacement for react-router-dom (BrowserRouter, Routes, Route,
 * Navigate) as used in src/App.js. Uses hash-based routing (#/path) so the
 * app runs from a plain file:// or static server with no server-side
 * rewrite rules required.
 *
 * Each page module registers itself via Router.register(path, renderFn, {role}).
 * renderFn(container) is called to paint the page into #root.
 * The `role` option reproduces the original <PrivateRoute role="...">
 * behavior: unauthenticated users are redirected to /login, and users with
 * the wrong role are redirected to /.
 */
const Router = (() => {
  const routes = {};

  function register(path, renderFn, options = {}) {
    routes[path] = { renderFn, options };
  }

  function navigateTo(path) {
    window.location.hash = `#${path}`;
  }

  function currentPath() {
    const hash = window.location.hash || '#/';
    return hash.slice(1) || '/';
  }

  function resolve() {
    const path = currentPath();
    const root = document.getElementById('root');
    const route = routes[path];

    if (!route) {
      navigateTo('/');
      return;
    }

    const { renderFn, options } = route;
    const user = Auth.getUser();

    if (options.role) {
      if (!user) {
        navigateTo('/login');
        return;
      }
      if (user.role !== options.role) {
        navigateTo('/');
        return;
      }
    }

    root.innerHTML = '';
    renderFn(root);
  }

  window.addEventListener('hashchange', resolve);
  window.addEventListener('DOMContentLoaded', resolve);

  return { register, navigateTo, resolve };
})();

// Convenience global matching the short name used in navbar.js / pages
function navigateTo(path) {
  Router.navigateTo(path);
}
