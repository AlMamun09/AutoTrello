import { useState, useRef, useEffect } from 'react';
import { chatWithBoard } from '@/lib/ai';
import type { Project, Task } from '@/lib/db';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function AiChatPanel({ 
  project, 
  tasks, 
  collapsed, 
  onCollapse, 
  onExpand 
}: {
  project: Project;
  tasks: Task[];
  collapsed: boolean;
  onCollapse: () => void;
  onExpand: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hi! I'm your AutoTrello AI Agent. I've analyzed "${project.name}" and I'm ready to help you manage your backlog. What's on your mind?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatWithBoard([...messages, userMsg], project, tasks);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I encountered an error: ${message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (collapsed) {
    return (
      <div className="at-side-panel collapsed">
        <button
          className="at-panel-expand-tab"
          onClick={onExpand}
          style={{ 
            display: 'flex', position: 'absolute', left: -28, top: '50%', 
            transform: 'translateY(-50%)', background: '#1E293B', 
            border: '1px solid #334155', borderRight: 'none', 
            padding: '12px 5px', borderRadius: '6px 0 0 6px', cursor: 'pointer' 
          }}
        >
          <span style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', fontSize: 10, fontWeight: 700, color: '#64748B', letterSpacing: '0.1em' }}>AI AGENT</span>
        </button>
      </div>
    );
  }

  return (
    <div className="at-side-panel" style={{ width: 340, display: 'flex', flexDirection: 'column' }}>
      <div className="at-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
          <span style={{ fontWeight: 600 }}>AI Agent</span>
        </div>
        <button className="at-btn at-btn-ghost" onClick={onCollapse} style={{ padding: '4px 6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/>
          </svg>
        </button>
      </div>

      <div 
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            style={{ 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              background: msg.role === 'user' ? '#2563EB' : '#1E293B',
              color: msg.role === 'user' ? '#fff' : '#CBD5E1',
              padding: '10px 12px',
              borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              fontSize: 13,
              lineHeight: 1.5,
              border: msg.role === 'assistant' ? '1px solid #334155' : 'none'
            }}
          >
            {msg.content}
          </div>
        ))}
        {isTyping && (
          <div style={{ alignSelf: 'flex-start', background: '#1E293B', padding: '10px 12px', borderRadius: '12px 12px 12px 2px', border: '1px solid #334155' }}>
            <div className="at-typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '14px', borderTop: '1px solid #1E293B' }}>
        <div style={{ position: 'relative' }}>
          <textarea
            className="at-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask about your project..."
            rows={2}
            style={{ 
              width: '100%', resize: 'none', paddingRight: '44px', paddingLeft: '12px',
              paddingTop: '10px', background: '#0F172A', fontSize: 13, minHeight: 60
            }}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            style={{ 
              position: 'absolute', right: 8, bottom: 8, 
              background: '#2563EB', color: '#fff', border: 'none', 
              borderRadius: '6px', width: 32, height: 32, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', opacity: (!input.trim() || isTyping) ? 0.5 : 1
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <div style={{ fontSize: 10, color: '#475569', marginTop: 8, textAlign: 'center' }}>
          AI can help brainstorm tasks or explain requirements
        </div>
      </div>
    </div>
  );
}
