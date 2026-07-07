/**
 * seekerDashboard.js
 * Vanilla replacement for src/pages/SeekerDashboard.js
 */
function renderSeekerDashboardPage(container) {
  const user = Auth.getUser();

  let state = {
    view: 'jobs',
    jobs: [],
    applications: [],
    profile: null,
    search: '',
    applyingJob: null,
    applyForm: {},
    profileForm: {
      fullName: '',
      skills: '',
      resumeUrl: '',
      about: '',
    },
  };

  function setState(patch) {
    state = { ...state, ...patch };
    render();
  }

  function fetchJobs() {
    api.get('/jobs').then((res) => setState({ jobs: res.data }));
  }

  function fetchApplications() {
    api.get('/applications/seeker').then((res) => setState({ applications: res.data }));
  }

  function fetchProfile() {
    api.get('/profiles/me').then((res) => {
      setState({
        profile: res.data,
        profileForm: {
          fullName: user?.fullName || '',
          skills: res.data.skills || '',
          resumeUrl: res.data.resumeUrl || '',
          about: res.data.about || '',
        },
      });
    });
  }

  function hasApplied(jobId) {
    return state.applications.some((a) => a.job?.id === jobId);
  }

  function openApplyModal(job) {
    setState({
      applyingJob: job,
      applyForm: {
        fullName: user?.fullName || '',
        email: localStorage.getItem('username') || user?.username || '',
        phone: '',
        skills: state.profile?.skills || '',
        experience: '',
        resumeUrl: state.profile?.resumeUrl || '',
        coverLetter: '',
      },
    });
  }

  async function submitApplication(e) {
    e.preventDefault();
    try {
      await api.post(`/applications/apply/${state.applyingJob.id}`, state.applyForm);
      alert('Applied successfully!');
      setState({ applyingJob: null });
      fetchApplications();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to apply');
    }
  }

  async function withdraw(applicationId) {
    if (!window.confirm('Withdraw this application?')) return;
    await api.delete(`/applications/${applicationId}`);
    setState({ applications: state.applications.filter((a) => a.id !== applicationId) });
  }

  async function saveProfile(e) {
    e.preventDefault();
    try {
      const res = await api.put('/profiles/me', state.profileForm);
      alert('Profile updated successfully!');
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.fullName = state.profileForm.fullName;
      localStorage.setItem('user', JSON.stringify(storedUser));
      setState({ profile: res.data });
    } catch (err) {
      alert('Failed to update profile');
    }
  }

  function getFilteredJobs() {
    const search = state.search.toLowerCase();
    return state.jobs.filter(
      (j) =>
        j.title?.toLowerCase().includes(search) ||
        j.location?.toLowerCase().includes(search)
    );
  }

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[m]));
  }

  function render() {
    const filteredJobs = getFilteredJobs();

    container.innerHTML = `
      <div class="container" id="session-container-t28">
        <div class="flex-between">
          <h2>Seeker Dashboard</h2>
          <div>
            <button class="btn btn-secondary" id="nav-jobs-btn">Jobs</button>
            <button class="btn btn-secondary" id="nav-profile-btn">Profile</button>
          </div>
        </div>

        ${state.view === 'jobs' ? renderJobsView(filteredJobs) : ''}
        ${state.view === 'profile' ? renderProfileView() : ''}

        ${state.applyingJob ? renderApplyModal() : ''}
      </div>
    `;

    document.getElementById('nav-jobs-btn').addEventListener('click', () => setState({ view: 'jobs' }));
    document.getElementById('nav-profile-btn').addEventListener('click', () => setState({ view: 'profile' }));

    if (state.view === 'jobs') bindJobsEvents();
    if (state.view === 'profile') bindProfileEvents();
    if (state.applyingJob) bindApplyModalEvents();
  }

  function renderJobsView(filteredJobs) {
    return `
      <input id="search-input" placeholder="Search opportunities..." value="${escapeHtml(state.search)}" />

      <div style="display:flex; gap:24px;">
        <div style="flex:2;">
          <h3>Live Jobs</h3>
          ${filteredJobs
            .map(
              (job) => `
            <div class="card">
              <strong>${job.title}</strong> — ${job.location}
              <div>${job.description}</div>
              <button class="btn apply-btn" data-id="${job.id}" ${hasApplied(job.id) ? 'disabled' : ''}>
                ${hasApplied(job.id) ? 'Applied' : 'Apply'}
              </button>
            </div>
          `
            )
            .join('')}
        </div>

        <div style="flex:1;">
          <h3>My Applications</h3>
          ${state.applications.length === 0 ? '<p>No applications yet.</p>' : ''}
          ${state.applications
            .map(
              (app) => `
            <div class="card">
              <div>${app.job?.title ?? ''}</div>
              <div>Status: ${app.status}</div>
              <button class="withdraw-btn" data-id="${app.id}">${Icons.trash2(14)}</button>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  function bindJobsEvents() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
      // Update state without a full re-render on every keystroke would be ideal,
      // but re-rendering keeps this in line with the rest of the app's simple model.
      state.search = e.target.value;
      const caret = searchInput.selectionStart;
      render();
      const newInput = document.getElementById('search-input');
      newInput.focus();
      newInput.setSelectionRange(caret, caret);
    });

    document.querySelectorAll('.apply-btn').forEach((btn) =>
      btn.addEventListener('click', () => {
        const job = state.jobs.find((j) => j.id === Number(btn.dataset.id));
        openApplyModal(job);
      })
    );
    document.querySelectorAll('.withdraw-btn').forEach((btn) =>
      btn.addEventListener('click', () => withdraw(Number(btn.dataset.id)))
    );
  }

  function renderProfileView() {
    const f = state.profileForm;
    return `
      <form id="profile-form" style="max-width:420px;">
        <label>Full Name</label>
        <input id="p-fullName" value="${escapeHtml(f.fullName)}" />
        <label>Skills</label>
        <input id="p-skills" value="${escapeHtml(f.skills)}" />
        <label>Resume URL</label>
        <input id="p-resumeUrl" value="${escapeHtml(f.resumeUrl)}" />
        <label>About Me</label>
        <textarea id="p-about">${escapeHtml(f.about)}</textarea>
        <button type="submit" class="btn">Save Profile</button>
      </form>
    `;
  }

  function bindProfileEvents() {
    const ids = ['fullName', 'skills', 'resumeUrl', 'about'];
    ids.forEach((id) => {
      document.getElementById(`p-${id}`).addEventListener('input', (e) => {
        state.profileForm[id] = e.target.value;
      });
    });
    document.getElementById('profile-form').addEventListener('submit', saveProfile);
  }

  function renderApplyModal() {
    const f = state.applyForm;
    return `
      <div class="modal-overlay">
        <div class="modal">
          <h3>Apply for ${escapeHtml(state.applyingJob.title)}</h3>
          <form id="apply-form">
            <label>Full Name</label>
            <input id="a-fullName" value="${escapeHtml(f.fullName)}" />
            <label>Email</label>
            <input id="a-email" value="${escapeHtml(f.email)}" />
            <label>Phone</label>
            <input id="a-phone" value="${escapeHtml(f.phone)}" />
            <label>Experience (years)</label>
            <input id="a-experience" type="number" value="${escapeHtml(f.experience)}" />
            <label>Skills</label>
            <input id="a-skills" value="${escapeHtml(f.skills)}" />
            <label>Resume URL</label>
            <input id="a-resumeUrl" value="${escapeHtml(f.resumeUrl)}" />
            <label>Cover Letter</label>
            <textarea id="a-coverLetter">${escapeHtml(f.coverLetter)}</textarea>
            <div class="flex-row">
              <button type="submit" class="btn">Submit</button>
              <button type="button" class="btn btn-secondary" id="apply-cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  function bindApplyModalEvents() {
    const ids = ['fullName', 'email', 'phone', 'experience', 'skills', 'resumeUrl', 'coverLetter'];
    ids.forEach((id) => {
      document.getElementById(`a-${id}`).addEventListener('input', (e) => {
        state.applyForm[id] = e.target.value;
      });
    });
    document.getElementById('apply-form').addEventListener('submit', submitApplication);
    document.getElementById('apply-cancel-btn').addEventListener('click', () => setState({ applyingJob: null }));
  }

  fetchJobs();
  fetchApplications();
  fetchProfile();
  render();
}

Router.register('/seeker-dashboard', renderSeekerDashboardPage, { role: 'JOB_SEEKER' });
