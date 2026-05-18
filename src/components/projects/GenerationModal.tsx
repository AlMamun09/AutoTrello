import { useState, useEffect } from 'react';
import { SparklesIcon, ListChecksIcon, CardIcon, TagIcon, CheckCircleIcon } from '@/lib/icons';

const GENERATION_TIPS = [
  'AI is analyzing your document structure and extracting key requirements…',
  'Generating workflow stages tailored to your project type…',
  'Creating task cards with priorities, labels, and subtasks…',
  'Organizing tasks into the most logical column flow…',
  'Reviewing coverage to ensure no critical requirements are missed…',
];

type GenerationPhase = 'idle' | 'generating' | 'complete';

export function GenerationModal({
  phase,
  progressMsg,
  progressPercent,
  result,
  onOpenBoard,
}: {
  phase: GenerationPhase;
  progressMsg?: string;
  progressPercent?: number;
  result?: {
    projectName: string;
    columnCount: number;
    taskCount: number;
    subtaskCount: number;
    labelCount: number;
  };
  onOpenBoard?: () => void;
}) {
  const [tipIndex, setTipIndex] = useState(0);

  // Rotate tips every 4 seconds during generation
  useEffect(() => {
    if (phase !== 'generating') return;
    setTipIndex(0);
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % GENERATION_TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [phase]);

  if (phase === 'idle') return null;

  return (
    <div className="at-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="generation-modal-title">
      <div className="at-modal at-generation-modal" onClick={e => e.stopPropagation()}>
        {phase === 'generating' ? (
          <>
            {/* Generating state */}
            <div className="at-gen-header">
              <div className="at-gen-orb">
                <SparklesIcon size={22} color="#07111F" />
              </div>
              <h2 id="generation-modal-title" style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--at-text)', letterSpacing: '-0.03em' }}>
                Generating Your Backlog
              </h2>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--at-text-muted)', lineHeight: 1.5 }}>
                This may take a moment depending on document size and AI response time.
              </p>
            </div>

            {/* Progress indicator */}
            <div className="at-gen-progress">
              <div className="at-gen-progress-bar">
                <div
                  className="at-gen-progress-fill"
                  style={{ width: `${progressPercent ?? 0}%` }}
                />
              </div>
              <div className="at-gen-progress-label">{progressPercent ?? 0}%</div>
            </div>

            {/* Current step */}
            {progressMsg && (
              <div className="at-gen-step">
                <div className="at-spinner" style={{ width: 14, height: 14, borderWidth: 2, color: 'var(--at-primary)', flexShrink: 0 }} />
                <span>{progressMsg}</span>
              </div>
            )}

            {/* Rotating tips */}
            <div className="at-gen-tip">
              <span className="at-gen-tip-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </span>
              <span key={tipIndex} className="at-gen-tip-text">{GENERATION_TIPS[tipIndex]}</span>
            </div>
          </>
        ) : (
          <>
            {/* Complete state */}
            <div className="at-gen-header">
              <div className="at-gen-orb at-gen-orb-success">
                <CheckCircleIcon size={22} color="#07111F" />
              </div>
              <h2 id="generation-modal-title" style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--at-text)', letterSpacing: '-0.03em' }}>
                Backlog Generated!
              </h2>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--at-text-muted)', lineHeight: 1.5 }}>
                Your project <strong style={{ color: 'var(--at-text)' }}>{result?.projectName}</strong> is ready to explore.
              </p>
            </div>

            {/* Summary stats */}
            {result && (
              <div className="at-gen-stats">
                <div className="at-gen-stat">
                  <div className="at-gen-stat-icon" style={{ background: 'rgba(96,165,250,0.12)', color: '#60A5FA' }}>
                    <ListChecksIcon size={16} />
                  </div>
                  <div>
                    <div className="at-gen-stat-value">{result.columnCount}</div>
                    <div className="at-gen-stat-label">Lists</div>
                  </div>
                </div>
                <div className="at-gen-stat">
                  <div className="at-gen-stat-icon" style={{ background: 'rgba(184,247,212,0.12)', color: '#B8F7D4' }}>
                    <CardIcon size={16} />
                  </div>
                  <div>
                    <div className="at-gen-stat-value">{result.taskCount}</div>
                    <div className="at-gen-stat-label">Cards</div>
                  </div>
                </div>
                <div className="at-gen-stat">
                  <div className="at-gen-stat-icon" style={{ background: 'rgba(253,186,116,0.12)', color: '#FDBA74' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                  </div>
                  <div>
                    <div className="at-gen-stat-value">{result.subtaskCount}</div>
                    <div className="at-gen-stat-label">Subtasks</div>
                  </div>
                </div>
                <div className="at-gen-stat">
                  <div className="at-gen-stat-icon" style={{ background: 'rgba(196,181,253,0.12)', color: '#C4B5FD' }}>
                    <TagIcon size={16} />
                  </div>
                  <div>
                    <div className="at-gen-stat-value">{result.labelCount}</div>
                    <div className="at-gen-stat-label">Labels</div>
                  </div>
                </div>
              </div>
            )}

            {/* Action button */}
            <button className="at-btn at-btn-primary at-gen-cta" onClick={onOpenBoard}>
              Open Board
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
