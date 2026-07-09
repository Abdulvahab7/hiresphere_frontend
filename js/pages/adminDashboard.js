/**
 * adminDashboard.js
 * Complete Admin Dashboard
 */

function renderAdminDashboardPage(container) {

    container.innerHTML = `
        <div class="loading">
            Loading Admin Dashboard...
        </div>
    `;

    Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
    ])

    .then(([statsResponse, usersResponse]) => {

        const stats = statsResponse.data;
        const users = usersResponse.data;

        let filteredUsers = [...users];

        function renderTable() {

            const tableBody = filteredUsers.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.fullName || '-'}</td>
                    <td>${user.username}</td>
                    <td>${user.role}</td>

                    <td>

                        ${
                            user.blocked
                            ? `<span class="status blocked">Blocked</span>`
                            : `<span class="status active">Active</span>`
                        }

                    </td>

                    <td>

                        <button
                            class="btn-primary"
                            onclick="alert('Backend will be connected in next step for ${user.username}')"
                        >
                            ${user.blocked ? 'Unblock' : 'Block'}
                        </button>

                        <button
                            class="btn-danger"
                            onclick="alert('Delete API will be connected next step')"
                        >
                            Delete
                        </button>

                    </td>

                </tr>
            `).join('');

            document.getElementById("admin-user-table").innerHTML = tableBody;
        }

        container.innerHTML = `

        <div class="container">

            <h2>Admin Dashboard</h2>

            <div class="stat-grid">

                <div class="card">
                    <small>Total Users</small>
                    <h2>${stats.totalUsers}</h2>
                </div>

                <div class="card">
                    <small>Employers</small>
                    <h2>${stats.totalEmployers}</h2>
                </div>

                <div class="card">
                    <small>Job Seekers</small>
                    <h2>${stats.totalJobSeekers}</h2>
                </div>

                <div class="card">
                    <small>Total Jobs</small>
                    <h2>${stats.totalJobsPosted}</h2>
                </div>

                <div class="card">
                    <small>Applications</small>
                    <h2>${stats.totalApplications}</h2>
                </div>

                <div class="card">
                    <small>Active Jobs</small>
                    <h2>${stats.activeJobs}</h2>
                </div>

                <div class="card">
                    <small>Blocked Users</small>
                    <h2>${stats.blockedUsers}</h2>
                </div>

            </div>

            <div class="card" style="margin-top:30px;">

                <div style="display:flex;justify-content:space-between;align-items:center;">

                    <h3>User Management</h3>

                    <input
                        id="searchUser"
                        type="text"
                        placeholder="Search username..."
                        style="
                            padding:10px;
                            width:250px;
                            border-radius:8px;
                            border:1px solid #ccc;
                        "
                    >

                </div>

                <table class="admin-table">

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>Full Name</th>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>

                        </tr>

                    </thead>

                    <tbody id="admin-user-table">

                    </tbody>

                </table>

            </div>

        </div>

        `;

        renderTable();

        document
            .getElementById("searchUser")
            .addEventListener("keyup", function () {

                const value = this.value.toLowerCase();

                filteredUsers = users.filter(user =>

                    user.username.toLowerCase().includes(value) ||

                    (user.fullName || "").toLowerCase().includes(value)

                );

                renderTable();

            });

    })

    .catch(() => {

        container.innerHTML = `
            <div class="error-message">
                Failed to load admin dashboard.
            </div>
        `;

    });

}

Router.register('/admin-dashboard', renderAdminDashboardPage, {
    role: 'ADMIN'
});
