/**
 * home.js
 * Vanilla replacement for src/pages/Home.js
 */
function renderHomePage(container) {
  container.innerHTML = `
    <div>
      <section class="hero">
        <h1 id="hero-heading-t30">Connect with Your Dream Job</h1>
        <p>
          HireSphere uses advanced skill-matching technology to connect the right
          talent with the right opportunities. Simple, efficient, and transparent.
        </p>
        <div style="display:flex; gap:12px; justify-content:center; margin-top:20px;">
          <a href="#/register" class="btn">Get Started</a>
          <a href="#/login" class="btn btn-secondary">Login</a>
        </div>
      </section>

      <div class="feature-cards">
        <div class="feature-card">
          ${Icons.zap(24)}
          <h3>Skill Matching</h3>
          <p>Our algorithm calculates a match score based on your unique skills and job requirements.</p>
        </div>
        <div class="feature-card">
          ${Icons.briefcase(24)}
          <h3>Diverse Roles</h3>
          <p>Whether you're a job seeker or an employer, we have roles tailored for everyone.</p>
        </div>
        <div class="feature-card">
          ${Icons.shieldCheck(24)}
          <h3>Verified Profiles</h3>
          <p>Secure authentication and verified company profiles ensure a trustworthy environment.</p>
        </div>
      </div>

      <footer>© 2026 HireSphere. Built for excellence.</footer>
    </div>
  `;
}

Router.register('/', renderHomePage);
