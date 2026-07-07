/**
 * employerDashboard.js
 * Vanilla replacement for src/pages/EmployerDashboard.js
 */
function renderEmployerDashboardPage(container) {
  // Local component state (replaces useState)
  let state = {
    view: 'list',
    jobs: [],
    editingJob: null,
    candidates: [],
    activeJobId: null,
    form: {
      jobTitle: '',
      description: '',
      location: '',
      salary: '',
      requiredSkills: '',
      experienceRequired: '',
    },
  };

  function setState(patch) {
    state = { ...state, ...patch };
    render();
  }

  function fetchJobs() {
    api.get('/jobs/employer').then((res) => setState({ jobs: res.data }));
  }

  function openForm(job) {
    if (job) {
      setState({
        editingJob: job,
        form: {
          jobTitle: job.title,
          description: job.description,
          location: job.location,
          salary: job.salary,
          requiredSkills: job.requiredSkills,
          experienceRequired: job.experienceRequired,
        },
        view: 'form',
      });
    } else {
      setState({
        editingJob: null,
        form: {
          jobTitle: '',
          description: '',
          location: '',
          salary: '',
          requiredSkills: '',
          experienceRequired: '',
        },
        view: 'form',
      });
    }
  }

  async function handleDelete(jobId) {
    if (!window.confirm('Are you sure? This will also delete all applications for this job.')) {
      return;
    }
    await api.delete(`/jobs/${jobId}`);
    setState({ jobs: state.jobs.filter((j) => j.id !== jobId) });
  }

  async function handleReview(jobId) {
    const res = await api.get(`/applications/job/${jobId}`);
    setState({ candidates: res.data, activeJobId: jobId, view: 'candidates' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      title: state.form.jobTitle,
      description: state.form.description,
      location: state.form.location,
      salary: Number(state.form.salary),
      requiredSkills: state.form.requiredSkills,
      experienceRequired: Number(state.form.experienceRequired),
    };

    try {
      if (state.editingJob) {
        await api.put(`/jobs/${state.editingJob.id}`, payload);
        alert('Job updated successfully!');
      } else {
        await api.post('/jobs', payload);
        alert('Job posted successfully!');
      }
      fetchJobs();
      setState({ view: 'list' });
    } catch (err) {
      alert('Failed to save job');
    }
  }

  async function setStatus(applicationId, status) {
    const res = await api.put(`/applications/${applicationId}/status?status=${status}`);
    setState({
      candidates: state.candidates.map((c) => (c.id === applicationId ? res.data : c)),
    });
  }

  function updateForm(field, value) {
    state.form[field] = value;
  }

  function render() {
    container.innerHTML = `
      <div class="container">
        <div class="flex-between">
          <h2>Employer Dashboard</h2>
          <div>
            <button class="btn btn-secondary icon-inline" id="nav-list-btn">
              ${Icons.briefcase(14)} My Jobs
            </button>
            <button class="btn icon-inline" id="nav-post-btn">
              ${Icons.plus(14)} Post Job
            </button>
          </div>
        </div>

        ${state.view === 'list' ? renderListView() : ''}
        ${state.view === 'form' ? renderFormView() : ''}
        ${state.view === 'candidates' ? renderCandidatesView() : ''}
      </div>
    `;

    document.getElementById('nav-list-btn').addEventListener('click', () => setState({ view: 'list' }));
    document.getElementById('nav-post-btn').addEventListener('click', () => openForm(null));

    if (state.view === 'list') bindListEvents();
    if (state.view === 'form') bindFormEvents();
    if (state.view === 'candidates') bindCandidatesEvents();
  }

  function renderListView() {
    return `
      <div>
        ${state.jobs
          .map(
            (job) => `
          <div class="card" data-job-id="${job.id}">
            <strong>${job.title}</strong> — ${job.location}
            <div>Experience: ${job.experienceRequired} yrs</div>
            <div>Applications: ${job.applicationsCount}</div>
            <div class="flex-row mt-8">
              <button class="edit-btn" data-id="${job.id}">Edit</button>
              <button class="delete-btn" data-id="${job.id}">Delete</button>
              <button class="review-btn" data-id="${job.id}">Review</button>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  function bindListEvents() {
    document.querySelectorAll('.edit-btn').forEach((btn) =>
      btn.addEventListener('click', () => {
        const job = state.jobs.find((j) => j.id === Number(btn.dataset.id));
        openForm(job);
      })
    );
    document.querySelectorAll('.delete-btn').forEach((btn) =>
      btn.addEventListener('click', () => handleDelete(Number(btn.dataset.id)))
    );
    document.querySelectorAll('.review-btn').forEach((btn) =>
      btn.addEventListener('click', () => handleReview(Number(btn.dataset.id)))
    );
  }

  function renderFormView() {
    const f = state.form;
    return `
      <div class="card" style="max-width:480px;">
        <h3>Post a New Opportunity</h3>
        <form id="job-form">
          <label>Job Title</label>
          <input id="f-jobTitle" value="${escapeAttr(f.jobTitle)}" />
          <label>Description</label>
          <textarea id="f-description">${escapeHtml(f.description)}</textarea>
          <div class="flex-row">
            <div style="flex:1;">
              <label>Location</label>
              <input id="f-location" value="${escapeAttr(f.location)}" />
            </div>
            <div style="flex:1;">
              <label>Salary (Monthly)</label>
              <input id="f-salary" type="number" value="${escapeAttr(f.salary)}" />
            </div>
          </div>
          <div class="flex-row">
            <div style="flex:1;">
              <label>Required Skills</label>
              <input id="f-requiredSkills" value="${escapeAttr(f.requiredSkills)}" />
            </div>
            <div style="flex:1;">
              <label>Exp Required (Years)</label>
              <input id="f-experienceRequired" type="number" value="${escapeAttr(f.experienceRequired)}" />
            </div>
          </div>
          <button type="submit" class="btn">
            ${state.editingJob ? 'Update Job' : 'Publish Job'}
          </button>
        </form>
      </div>
    `;
  }

  function bindFormEvents() {
    const ids = ['jobTitle', 'description', 'location', 'salary', 'requiredSkills', 'experienceRequired'];
    ids.forEach((id) => {
      const el = document.getElementById(`f-${id}`);
      el.addEventListener('input', (e) => updateForm(id, e.target.value));
    });
    document.getElementById('job-form').addEventListener('submit', handleSubmit);
  }

  function renderCandidatesView() {
    return `
      <div>
        <h3>Candidates for Job #${state.activeJobId}</h3>
        ${state.candidates
          .map(
            (c) => `
          <div class="card">
            <strong>${c.fullName}</strong>
            <div>Experience: ${c.experience} yrs</div>
            <div>Match Score: ${c.matchScore}%</div>
            <div>Status: ${c.status}</div>
            <div class="flex-row mt-8">
              <button class="shortlist-btn" data-id="${c.id}">Shortlist</button>
              <button class="reject-btn" data-id="${c.id}">Reject</button>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  function bindCandidatesEvents() {
    document.querySelectorAll('.shortlist-btn').forEach((btn) =>
      btn.addEventListener('click', () => setStatus(Number(btn.dataset.id), 'SHORTLISTED'))
    );
    document.querySelectorAll('.reject-btn').forEach((btn) =>
      btn.addEventListener('click', () => setStatus(Number(btn.dataset.id), 'REJECTED'))
    );
  }

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[m]));
  }
  function escapeAttr(str) {
    return escapeHtml(str);
  }

  fetchJobs();
  render();
}

Router.register('/employer-dashboard', renderEmployerDashboardPage, { role: 'EMPLOYER' });
