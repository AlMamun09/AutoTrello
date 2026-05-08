import { Link } from 'react-router-dom';
import { ZapIcon, GridIcon, LayersIcon, ShieldIcon, SparklesIcon } from '@/lib/icons';

export function LandingPage() {
  return (
    <div style={{ 
      flex: 1, overflowY: 'auto', background: '#0F172A',
      display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative'
    }}>
      {/* Mesh Gradient Background */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '600px',
        background: 'radial-gradient(circle at 80% 0%, rgba(37, 99, 235, 0.15) 0%, transparent 40%), radial-gradient(circle at 20% 10%, rgba(168, 85, 247, 0.1) 0%, transparent 40%)',
        zIndex: 0, pointerEvents: 'none'
      }} />

      {/* Header */}
      <nav style={{ 
        width: '100%', maxWidth: 1200, height: 80, display: 'flex', alignItems: 'center', 
        justifyContent: 'space-between', padding: '0 24px', position: 'relative', zIndex: 10 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: 'var(--at-primary)', padding: 6, borderRadius: 8, display: 'flex' }}>
             <ZapIcon size={20} color="#fff" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>AutoTrello</span>
        </div>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <Link to="/projects" style={{ fontSize: 14, fontWeight: 500, color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>Projects</Link>
          <Link to="/projects" className="at-btn at-btn-primary" style={{ padding: '10px 24px', borderRadius: 100, fontWeight: 600, boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.3)' }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ maxWidth: 900, textAlign: 'center', marginTop: 120, marginBottom: 80, padding: '0 24px', position: 'relative', zIndex: 10 }}>
        <div style={{ 
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', 
          background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)', 
          borderRadius: 100, color: '#60A5FA', fontSize: 12, fontWeight: 600, marginBottom: 32,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <SparklesIcon size={14} />
          <span>Privacy-First Agile Generation</span>
        </div>
        <h1 style={{ 
          fontSize: 'clamp(40px, 8vw, 72px)', fontWeight: 850, color: '#fff', 
          lineHeight: 1, marginBottom: 28, letterSpacing: '-0.04em' 
        }}>
          Transform Documents into <br/> <span style={{ background: 'linear-gradient(to right, #3B82F6, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Trello Backlogs Instantly.</span>
        </h1>
        <p style={{ fontSize: 19, color: '#94A3B8', lineHeight: 1.6, maxWidth: 680, margin: '0 auto 48px' }}>
          Stop manually writing user stories. Upload your SRS or project notes, and let our AI engine generate a full Kanban board with native Trello checklists and labels.
        </p>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/projects" className="at-btn at-btn-primary" style={{ padding: '16px 42px', fontSize: 17, borderRadius: 14, fontWeight: 700, boxShadow: '0 20px 40px -10px rgba(37, 99, 235, 0.4)' }}>Launch App Free</Link>
          <a href="#features" className="at-btn at-btn-ghost" style={{ padding: '16px 42px', fontSize: 17, borderRadius: 14, border: '1px solid #1E293B', background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(10px)' }}>How it works</a>
        </div>
      </div>

      {/* Preview Section */}
      <div style={{ width: '100%', padding: '0 24px', marginBottom: 120 }}>
        <div style={{ 
          maxWidth: 1100, margin: '0 auto', background: '#1E293B', borderRadius: 24,
          border: '1px solid #334155', padding: '12px', boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden'
        }}>
          <div style={{ height: 40, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', borderBottom: '1px solid #334155', marginBottom: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F97316' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22C55E' }} />
            <div style={{ marginLeft: 'auto', background: '#0F172A', height: 20, width: 200, borderRadius: 4 }} />
          </div>
          <div style={{ height: 500, background: '#0F172A', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
                <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: 24, borderRadius: '50%', display: 'flex' }}>
                   <ZapIcon size={48} color="var(--at-primary)" />
                </div>
                <div>
                   <div style={{ color: '#F1F5F9', fontSize: 18, fontWeight: 600, marginBottom: 4 }}>AutoTrello Dashboard</div>
                   <div style={{ color: '#475569', fontSize: 14 }}>Ready to process your first SRS document</div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" style={{ width: '100%', maxWidth: 1200, padding: '80px 24px 140px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {[
          { title: 'AI Backlog Engine', desc: 'Advanced parsing for PDF, DOCX, and TXT. We extract user stories, acceptance criteria, and technical subtasks.', icon: <SparklesIcon color="#60A5FA" /> },
          { title: 'Privacy First', desc: 'No cloud database. Your API keys and project data stay strictly in your local browser storage.', icon: <ShieldIcon color="#34D399" /> },
          { title: 'Native Trello Sync', desc: 'We don\'t just copy text. We create real Trello Checklists, colored Labels, and organized Boards.', icon: <GridIcon color="#A78BFA" /> },
          { title: 'Smart Templates', desc: 'Workflows optimized for SDLC, Marketing, HR, and Operations out of the box.', icon: <LayersIcon color="#F472B6" /> }
        ].map((f, i) => (
          <div key={i} className="at-landing-card">
            <div style={{ 
              width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.03)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              {f.icon}
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 14 }}>{f.title}</h3>
            <p style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div style={{ 
        width: 'calc(100% - 48px)', maxWidth: 1200, background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', 
        borderRadius: 32, padding: '80px 40px', textAlign: 'center', border: '1px solid #334155', marginBottom: 100
      }}>
        <h2 style={{ fontSize: 42, fontWeight: 800, color: '#fff', marginBottom: 20 }}>Ready to automate your workflow?</h2>
        <p style={{ fontSize: 18, color: '#94A3B8', marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>Join developers and project managers using AutoTrello to skip the grunt work.</p>
        <Link to="/projects" className="at-btn at-btn-primary" style={{ padding: '16px 48px', fontSize: 18, borderRadius: 14, fontWeight: 700 }}>Get Started Now</Link>
      </div>

      {/* Footer */}
      <footer style={{ width: '100%', maxWidth: 1200, borderTop: '1px solid #1E293B', padding: '60px 24px', textAlign: 'center', color: '#475569', fontSize: 14 }}>
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <ZapIcon size={16} /> <span style={{ fontWeight: 700, color: '#94A3B8' }}>AutoTrello</span>
        </div>
        © 2026 AutoTrello. Build with focus on privacy and efficiency.
      </footer>

      <style>{`
        .at-landing-card {
          background: #1E293B;
          border: 1px solid #334155;
          padding: 40px;
          border-radius: 24px;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: default;
        }
        .at-landing-card:hover {
          border-color: #3B82F6;
          transform: translateY(-8px);
          background: #243044;
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </div>
  );
}
