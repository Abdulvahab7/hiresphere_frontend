/**
 * navbar.js
 * Vanilla replacement for the <nav className="navbar"> block in src/App.js
 * (and the standalone components/layout/Navbar.jsx, whose logout button is
 * folded into this same render since both drove the same UI element).
 */
function renderNavbar() {
  const el = document.getElementById('app-navbar');
  const user = Auth.getUser();

  el.innerHTML = `
    <a href="#/"><h2>HireSphere</h2></a>
    <div class="nav-links">
      ${
        !user
          ? `
        <a href="#/login">Login</a>
        <a href="#/register" class="btn">Register</a>
      `
          : `
        <span>${user.username} (${user.role})</span>
        <button class="btn btn-secondary icon-inline" id="navbar-logout-btn">
          ${Icons.logOut(14)} Logout
        </button>
      `
      }
    </div>
  `;

  if (user) {
    document.getElementById('navbar-logout-btn').addEventListener('click', () => {
      Auth.logout();
      navigateTo('/');
    });
  }
}

// Re-render whenever auth state changes (login/logout)
Auth.onChange(renderNavbar);
