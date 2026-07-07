/**
 * adminDashboard.js
 * Vanilla replacement for src/pages/AdminDashboard.js
 */
function renderAdminDashboardPage(container) {
  container.innerHTML = `<div class="loading">Loading dashboard metrics...</div>`;

  api
    .get('/admin/stats')
    .then((res) => {
      const stats = res.data;
      const cards = [
        { label: 'Total Users', value: stats.totalUsers },
        { label: 'Employers', value: stats.totalEmployers },
        { label: 'Job Seekers', value: stats.totalJobSeekers },
        { label: 'Total Jobs', value: stats.totalJobsPosted },
        { label: 'Applications', value: stats.totalApplications },
        { label: 'Active Jobs', value: stats.activeJobs },
        { label: 'Blocked Users', value: stats.blockedUsers },
      ];

      container.innerHTML = `
        <div class="container">
          <h2>Admin Analytics Dashboard</h2>
          <div class="stat-grid">
            ${cards
              .map(
                (c) => `
              <div class="card">
                <div style="font-size:13px; color:var(--color-muted);">${c.label}</div>
                <div style="font-size:28px; font-weight:700;">${c.value}</div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    })
    .catch(() => {
      container.innerHTML = `<div class="error-message">Failed to load dashboard metrics.</div>`;
    });
}

Router.register('/admin-dashboard', renderAdminDashboardPage, { role: 'ADMIN' });
