/**
 * login.js
 * Vanilla replacement for src/pages/Login.js
 */
function renderLoginPage(container) {
  container.innerHTML = `
    <div class="container" style="max-width:400px;">
      <h2>Login</h2>
      <form id="login-form">
        <label for="username">Username</label>
        <input id="username" name="username" />

        <label for="password">Password</label>
        <input id="password" name="password" type="password" />

        <button type="submit" class="btn">Log In</button>
      </form>
    </div>
  `;

  function navigateByRole(role) {
    if (role === 'JOB_SEEKER') navigateTo('/seeker-dashboard');
    else if (role === 'EMPLOYER') navigateTo('/employer-dashboard');
    else if (role === 'ADMIN') navigateTo('/admin-dashboard');
  }

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const res = await api.post('/auth/authenticate', { username, password });
      const userData = {
        username: res.data.username,
        fullName: res.data.fullName,
        role: res.data.role,
      };
      Auth.login(userData, res.data.token);
      navigateByRole(res.data.role);
    } catch (err) {
      alert('Invalid credentials / Login failed');
    }
  });
}

Router.register('/login', renderLoginPage);
