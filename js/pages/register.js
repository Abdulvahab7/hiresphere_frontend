/**
 * register.js
 * Vanilla replacement for src/pages/Register.js
 */
function renderRegisterPage(container) {
  function template(role) {
    return `
      <div class="container" style="max-width:420px;">
        <h2>Register</h2>
        <form id="register-form">
          <label for="role">Role</label>
          <select id="role" name="role">
            <option value="JOB_SEEKER" ${role === 'JOB_SEEKER' ? 'selected' : ''}>JOB_SEEKER</option>
            <option value="EMPLOYER" ${role === 'EMPLOYER' ? 'selected' : ''}>EMPLOYER</option>
          </select>

          <label for="fullName">Full Name</label>
          <input id="fullName" name="fullName" required />

          <label for="username">Username</label>
          <input id="username" name="username" required />

          <label for="password">Password</label>
          <input id="password" name="password" type="password" required />

          <div id="company-field" style="${role === 'EMPLOYER' ? '' : 'display:none;'}">
            <label for="companyName">Company Name</label>
            <input id="companyName" name="companyName" ${role === 'EMPLOYER' ? 'required' : ''} />
          </div>

          <button id="register-btn-t27" type="submit" class="btn">
            Register
          </button>
        </form>
      </div>
    `;
  }

  container.innerHTML = template('JOB_SEEKER');
  bindEvents();

  function bindEvents() {
    document.getElementById('role').addEventListener('change', (e) => {
      // Preserve entered values while re-rendering the company field toggle.
      const fullName = document.getElementById('fullName').value;
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const companyNameField = document.getElementById('companyName');
      const companyName = companyNameField ? companyNameField.value : '';

      container.innerHTML = template(e.target.value);
      document.getElementById('fullName').value = fullName;
      document.getElementById('username').value = username;
      document.getElementById('password').value = password;
      const newCompanyField = document.getElementById('companyName');
      if (newCompanyField) newCompanyField.value = companyName;

      bindEvents();
    });

    document.getElementById('register-form').addEventListener('submit', handleSubmit);
  }

  function navigateByRole(role) {
    if (role === 'JOB_SEEKER') navigateTo('/seeker-dashboard');
    else if (role === 'EMPLOYER') navigateTo('/employer-dashboard');
    else if (role === 'ADMIN') navigateTo('/admin-dashboard');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const role = document.getElementById('role').value;
    const fullName = document.getElementById('fullName').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const companyNameField = document.getElementById('companyName');
    const companyName = companyNameField ? companyNameField.value : '';

    try {
      const res = await api.post('/auth/register', {
        username,
        password,
        fullName,
        role,
        companyName,
      });
      const userData = {
        username: res.data.username,
        fullName: res.data.fullName,
        role: res.data.role,
      };
      Auth.login(userData, res.data.token);
      navigateByRole(res.data.role);
    } catch (err) {
      alert('Registration failed');
    }
  }
}

Router.register('/register', renderRegisterPage);
