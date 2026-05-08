import { Link } from 'react-router-dom';
import { GridIcon, LayersIcon, ShieldIcon, SparklesIcon, ZapIcon } from '@/lib/icons';

const features = [
  {
    title: 'Document to Backlog',
    desc: 'Upload SRS, DOCX, PDF, notes, or briefs and turn them into structured stories, tasks, subtasks, priorities, and labels.',
    icon: <SparklesIcon color="#B8F7D4" />,
  },
  {
    title: 'Trello-Ready Boards',
    desc: 'Create organized boards with native Trello lists, labels, cards, and checklists instead of copy-pasted walls of text.',
    icon: <GridIcon color="#93C5FD" />,
  },
  {
    title: 'Local-First Workspace',
    desc: 'Projects and settings stay in your browser unless you choose to call your configured AI provider or sync to Trello.',
    icon: <ShieldIcon color="#FDE68A" />,
  },
  {
    title: 'Workflow Templates',
    desc: 'Start from SDLC, marketing, education, HR, operations, CRM, design, and small-business workflows.',
    icon: <LayersIcon color="#FDBA74" />,
  },
];

const columns = [
  {
    name: 'Backlog',
    color: '#38BDF8',
    tasks: ['Parse SRS requirements', 'Define user roles', 'Create acceptance criteria'],
  },
  {
    name: 'In Progress',
    color: '#34D399',
    tasks: ['Generate task labels', 'Map subtasks to cards'],
  },
  {
    name: 'Ready for Trello',
    color: '#FBBF24',
    tasks: ['Create board lists', 'Attach checklists', 'Apply colored labels'],
  },
];

export function LandingPage() {
  return (
    <main className="landing-page">
      <div className="landing-aurora landing-aurora-one" />
      <div className="landing-aurora landing-aurora-two" />
      <div className="landing-grid-bg" />

      <nav className="landing-nav">
        <Link to="/" className="landing-brand" aria-label="AutoTrello AI home">
          <span className="landing-brand-mark">
            <ZapIcon size={20} color="#07111F" />
          </span>
          <span>AutoTrello AI</span>
        </Link>

        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <Link to="/projects" className="landing-nav-cta">Open App</Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <div className="landing-kicker">
            <SparklesIcon size={15} color="#B8F7D4" />
            AI backlog generation for real project documents
          </div>

          <h1>
            Turn messy specs into polished Trello boards.
          </h1>

          <p>
            AutoTrello AI reads your SRS, notes, or project brief and creates a practical Kanban backlog with tasks, labels, priorities, and subtasks ready for review or Trello sync.
          </p>

          <div className="landing-actions">
            <Link to="/projects" className="landing-primary-btn">Start Building</Link>
            <a href="#workflow" className="landing-secondary-btn">See Workflow</a>
          </div>

          <div className="landing-proof">
            <span><strong>5</strong> file formats</span>
            <span><strong>8+</strong> templates</span>
            <span><strong>Local</strong> storage</span>
          </div>
        </div>

        <div className="landing-preview" aria-label="AutoTrello board preview">
          <div className="landing-preview-topbar">
            <div className="landing-window-dots">
              <span />
              <span />
              <span />
            </div>
            <div className="landing-preview-url">autotrello.ai/backlog</div>
          </div>

          <div className="landing-preview-header">
            <div>
              <span className="landing-preview-label">Generated Board</span>
              <h2>Product Launch Workspace</h2>
            </div>
            <div className="landing-sync-pill">Trello Sync Ready</div>
          </div>

          <div className="landing-board">
            {columns.map((column) => (
              <div className="landing-board-column" key={column.name} style={{ '--accent': column.color } as React.CSSProperties}>
                <div className="landing-column-title">
                  <span>{column.name}</span>
                  <b>{column.tasks.length}</b>
                </div>
                {column.tasks.map((task, index) => (
                  <div className="landing-task-card" key={task}>
                    <div className="landing-task-priority">{index === 0 ? 'High' : 'Medium'}</div>
                    <p>{task}</p>
                    <div className="landing-task-footer">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="landing-section">
        <div className="landing-section-heading">
          <span>Why AutoTrello AI</span>
          <h2>Less backlog ceremony. More usable project structure.</h2>
        </div>

        <div className="landing-feature-grid">
          {features.map((feature) => (
            <article className="landing-feature-card" key={feature.title}>
              <div className="landing-feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="workflow" className="landing-workflow">
        <div className="landing-workflow-copy">
          <span>Three-step workflow</span>
          <h2>From document to board without rebuilding the plan by hand.</h2>
          <p>
            Keep the human review loop, but remove the blank-page work. Generate the first backlog draft, edit what matters, then export or sync.
          </p>
        </div>

        <div className="landing-steps">
          {['Upload your project document', 'Generate and refine the backlog', 'Export JSON or sync to Trello'].map((step, index) => (
            <div className="landing-step" key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <div>
          <span>Ready when your next spec lands</span>
          <h2>Build a board from your first document today.</h2>
        </div>
        <Link to="/projects" className="landing-primary-btn">Launch AutoTrello AI</Link>
      </section>

      <footer className="landing-footer">
        <span>AutoTrello AI</span>
        <p>Local-first backlog generation for focused teams.</p>
      </footer>

      <style>{`
        .landing-page {
          --landing-bg: #07111f;
          --landing-card: rgba(13, 27, 46, 0.74);
          --landing-card-solid: #0d1b2e;
          --landing-border: rgba(184, 247, 212, 0.14);
          --landing-text: #f7fbff;
          --landing-muted: #9fb1c8;
          --landing-mint: #b8f7d4;
          --landing-blue: #60a5fa;
          position: relative;
          flex: 1;
          min-height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          background:
            radial-gradient(circle at 50% -20%, rgba(96, 165, 250, 0.22), transparent 38%),
            linear-gradient(180deg, #07111f 0%, #0a1422 54%, #08101c 100%);
          color: var(--landing-text);
        }

        .landing-grid-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.28;
          background-image:
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: linear-gradient(to bottom, black, transparent 78%);
        }

        .landing-aurora {
          position: fixed;
          width: 480px;
          height: 480px;
          border-radius: 999px;
          filter: blur(40px);
          pointer-events: none;
          opacity: 0.42;
        }

        .landing-aurora-one {
          top: -150px;
          right: -120px;
          background: #1dce8a;
        }

        .landing-aurora-two {
          left: -180px;
          top: 320px;
          background: #2563eb;
        }

        .landing-nav,
        .landing-hero,
        .landing-section,
        .landing-workflow,
        .landing-cta,
        .landing-footer {
          position: relative;
          z-index: 1;
          width: min(1180px, calc(100% - 48px));
          margin-inline: auto;
        }

        .landing-nav {
          min-height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 10px 0;
        }

        .landing-brand,
        .landing-nav-links {
          display: flex;
          align-items: center;
        }

        .landing-brand {
          gap: 12px;
          color: #fff;
          font-size: 19px;
          font-weight: 850;
          letter-spacing: -0.04em;
          text-decoration: none;
        }

        .landing-brand-mark {
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--landing-mint), #60a5fa);
          box-shadow: 0 14px 36px rgba(29, 206, 138, 0.28);
        }

        .landing-nav-links {
          gap: 8px;
          padding: 7px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 999px;
          background: rgba(7, 17, 31, 0.58);
          backdrop-filter: blur(16px);
        }

        .landing-nav-links a {
          color: var(--landing-muted);
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          padding: 10px 14px;
          border-radius: 999px;
        }

        .landing-nav-links a:hover {
          color: #fff;
          background: rgba(255,255,255,0.06);
        }

        .landing-nav-links .landing-nav-cta {
          color: #07111f;
          background: var(--landing-mint);
        }

        .landing-hero {
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(400px, 1.08fr);
          gap: 34px;
          align-items: center;
          padding: 20px 0 44px;
        }

        .landing-hero-copy {
          max-width: 640px;
        }

        .landing-kicker {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 8px 14px;
          margin-bottom: 14px;
          color: var(--landing-mint);
          background: rgba(184, 247, 212, 0.08);
          border: 1px solid rgba(184, 247, 212, 0.18);
          border-radius: 999px;
          font-size: 13px;
          font-weight: 800;
          box-shadow: 0 14px 36px rgba(0,0,0,0.22);
        }

        .landing-hero h1 {
          margin: 0 0 14px;
          font-size: clamp(48px, 7vw, 88px);
          line-height: 0.93;
          letter-spacing: -0.075em;
          font-weight: 900;
          text-wrap: balance;
        }

        .landing-hero p {
          max-width: 590px;
          margin: 0;
          color: var(--landing-muted);
          font-size: 18px;
          line-height: 1.55;
        }

        .landing-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 20px;
        }

        .landing-primary-btn,
        .landing-secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          padding: 0 24px;
          border-radius: 16px;
          text-decoration: none;
          font-weight: 850;
          letter-spacing: -0.02em;
          transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease;
        }

        .landing-primary-btn {
          color: #07111f;
          background: linear-gradient(135deg, var(--landing-mint), #7dd3fc);
          box-shadow: 0 24px 60px rgba(45, 212, 191, 0.25);
        }

        .landing-secondary-btn {
          color: #fff;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
        }

        .landing-primary-btn:hover,
        .landing-secondary-btn:hover {
          transform: translateY(-2px);
        }

        .landing-proof {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 16px;
        }

        .landing-proof span {
          padding: 8px 11px;
          color: var(--landing-muted);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 999px;
          background: rgba(255,255,255,0.04);
          font-size: 13px;
        }

        .landing-proof strong {
          color: #fff;
        }

        .landing-preview {
          padding: 10px;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 26px;
          background:
            linear-gradient(145deg, rgba(184, 247, 212, 0.14), transparent 34%),
            rgba(8, 18, 32, 0.78);
          box-shadow: 0 36px 120px rgba(0,0,0,0.5);
          backdrop-filter: blur(18px);
          transform: rotate(1deg);
        }

        .landing-preview-topbar {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 7px 10px 10px;
        }

        .landing-window-dots {
          display: flex;
          gap: 7px;
        }

        .landing-window-dots span {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #f87171;
        }

        .landing-window-dots span:nth-child(2) { background: #fbbf24; }
        .landing-window-dots span:nth-child(3) { background: #34d399; }

        .landing-preview-url {
          flex: 1;
          padding: 6px 12px;
          border-radius: 999px;
          color: #7590ad;
          background: rgba(0,0,0,0.2);
          font-size: 12px;
        }

        .landing-preview-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          padding: 16px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px 24px 10px 10px;
          background: rgba(13, 27, 46, 0.78);
        }

        .landing-preview-label,
        .landing-section-heading span,
        .landing-workflow-copy span,
        .landing-cta span {
          color: var(--landing-mint);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .landing-preview-header h2 {
          margin: 4px 0 0;
          font-size: 21px;
          letter-spacing: -0.04em;
        }

        .landing-sync-pill {
          padding: 7px 10px;
          color: #07111f;
          border-radius: 999px;
          background: var(--landing-mint);
          font-size: 12px;
          font-weight: 900;
          white-space: nowrap;
        }

        .landing-board {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          padding: 10px;
          min-height: 270px;
          border: 1px solid rgba(255,255,255,0.08);
          border-top: none;
          border-radius: 10px 10px 24px 24px;
          background:
            radial-gradient(circle at 80% 0%, rgba(96, 165, 250, 0.16), transparent 36%),
            rgba(4, 10, 20, 0.52);
        }

        .landing-board-column {
          padding: 10px;
          border-radius: 18px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .landing-column-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 8px;
          color: #fff;
          border-bottom: 2px solid var(--accent);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .landing-column-title b {
          color: var(--accent);
        }

        .landing-task-card {
          margin-top: 9px;
          padding: 11px;
          border-radius: 15px;
          background: rgba(7, 17, 31, 0.86);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 12px 30px rgba(0,0,0,0.22);
        }

        .landing-task-priority {
          display: inline-flex;
          margin-bottom: 7px;
          padding: 3px 7px;
          border-radius: 999px;
          color: #07111f;
          background: var(--accent);
          font-size: 10px;
          font-weight: 900;
        }

        .landing-task-card p {
          margin: 0;
          color: #eaf2ff;
          font-size: 13px;
          line-height: 1.35;
        }

        .landing-task-footer {
          display: flex;
          gap: 6px;
          margin-top: 10px;
        }

        .landing-task-footer span {
          height: 7px;
          border-radius: 999px;
          background: rgba(255,255,255,0.12);
        }

        .landing-task-footer span:nth-child(1) { width: 34%; }
        .landing-task-footer span:nth-child(2) { width: 22%; }
        .landing-task-footer span:nth-child(3) { width: 16%; }

        .landing-section {
          padding: 4px 0 46px;
        }

        .landing-section-heading {
          max-width: 760px;
          margin-bottom: 18px;
        }

        .landing-section-heading h2,
        .landing-workflow-copy h2,
        .landing-cta h2 {
          margin: 10px 0 0;
          color: #fff;
          font-size: clamp(32px, 4.5vw, 56px);
          line-height: 1;
          letter-spacing: -0.06em;
          text-wrap: balance;
        }

        .landing-feature-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .landing-feature-card {
          padding: 20px;
          border: 1px solid var(--landing-border);
          border-radius: 28px;
          background: var(--landing-card);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
          transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
        }

        .landing-feature-card:hover {
          transform: translateY(-6px);
          border-color: rgba(184, 247, 212, 0.32);
          background: rgba(16, 34, 56, 0.86);
        }

        .landing-feature-icon {
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          margin-bottom: 16px;
          border-radius: 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .landing-feature-card h3 {
          margin: 0 0 8px;
          font-size: 19px;
          letter-spacing: -0.03em;
        }

        .landing-feature-card p,
        .landing-workflow-copy p,
        .landing-footer p {
          margin: 0;
          color: var(--landing-muted);
          line-height: 1.55;
        }

        .landing-workflow {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(340px, 1.1fr);
          gap: 34px;
          align-items: center;
          padding: 30px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 36px;
          background:
            linear-gradient(135deg, rgba(184, 247, 212, 0.12), transparent 40%),
            rgba(13, 27, 46, 0.72);
        }

        .landing-workflow-copy p {
          max-width: 520px;
          margin-top: 10px;
          font-size: 16px;
        }

        .landing-steps {
          display: grid;
          gap: 10px;
        }

        .landing-step {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 22px;
          background: rgba(7,17,31,0.54);
        }

        .landing-step span {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          flex: 0 0 auto;
          border-radius: 15px;
          color: #07111f;
          background: linear-gradient(135deg, var(--landing-mint), #7dd3fc);
          font-weight: 950;
        }

        .landing-step p {
          margin: 0;
          color: #fff;
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.025em;
        }

        .landing-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
          margin-top: 40px;
          padding: 28px;
          border: 1px solid rgba(184, 247, 212, 0.18);
          border-radius: 34px;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.22), rgba(29, 206, 138, 0.12));
        }

        .landing-cta h2 {
          max-width: 700px;
        }

        .landing-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 22px 0 28px;
          color: var(--landing-muted);
        }

        .landing-footer span {
          color: #fff;
          font-weight: 900;
        }

        @media (max-width: 1040px) {
          .landing-hero,
          .landing-workflow {
            grid-template-columns: 1fr;
          }

          .landing-hero {
            padding-top: 14px;
          }

          .landing-preview {
            transform: none;
          }

          .landing-feature-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .landing-nav,
          .landing-hero,
          .landing-section,
          .landing-workflow,
          .landing-cta,
          .landing-footer {
            width: min(100% - 28px, 1180px);
          }

          .landing-nav {
            align-items: flex-start;
            flex-direction: column;
            min-height: auto;
            padding-top: 18px;
          }

          .landing-nav-links {
            width: 100%;
            justify-content: space-between;
            overflow-x: auto;
          }

          .landing-nav-links a {
            white-space: nowrap;
          }

          .landing-hero {
            gap: 22px;
            padding: 18px 0 34px;
          }

          .landing-hero h1 {
            font-size: clamp(42px, 14vw, 64px);
          }

          .landing-hero p {
            font-size: 16px;
          }

          .landing-actions a {
            width: 100%;
          }

          .landing-preview {
            margin-inline: -6px;
            padding: 10px;
            border-radius: 24px;
          }

          .landing-preview-header,
          .landing-board {
            border-radius: 18px;
          }

          .landing-preview-header {
            flex-direction: column;
            padding: 18px;
          }

          .landing-board {
            grid-template-columns: 1fr;
            min-height: 0;
          }

          .landing-feature-grid {
            grid-template-columns: 1fr;
          }

          .landing-section {
            padding-bottom: 30px;
          }

          .landing-workflow,
          .landing-cta {
            padding: 18px;
            border-radius: 26px;
          }

          .landing-cta,
          .landing-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .landing-cta .landing-primary-btn {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
