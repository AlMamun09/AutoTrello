import { useState, useRef, useEffect } from 'react';
import { chatWithBoard, type BoardAgentAction } from '@/lib/ai';
import type { Project, Task } from '@/lib/db';
import { SparklesIcon } from '@/lib/icons';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function AiChatPanel({
  project,
  tasks,
  collapsed,
  onCollapse,
  onExpand,
  columns,
  onAgentActions,
}: {
  project: Project;
  tasks: Task[];
  collapsed: boolean;
  onCollapse: () => void;
  onExpand: () => void;
  columns: string[];
  onAgentActions: (actions: BoardAgentAction[]) => Promise<number>;
}) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `I reviewed "${project.name}". Ask me to summarize scope, spot gaps, or suggest the next backlog items.` },
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
    const prompt = input.trim();
    if (!prompt || isTyping) return;

    const userMsg: Message = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatWithBoard([...messages, userMsg], project, tasks, columns);
      const applied = response.actions.length ? await onAgentActions(response.actions) : 0;
      const actionNote = applied > 0 ? `\n\nApplied ${applied} board change${applied === 1 ? '' : 's'}.` : '';
      setMessages(prev => [...prev, { role: 'assistant', content: `${response.reply}${actionNote}` }]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setMessages(prev => [...prev, { role: 'assistant', content: `I could not complete that request: ${message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (collapsed) {
    return (
      <aside className="at-chat-rail">
        <button className="at-chat-rail-button" onClick={onExpand} title="Open AI assistant">
          <SparklesIcon size={17} color="#07111F" />
          <span>AI</span>
        </button>
      </aside>
    );
  }

  return (
    <aside className="at-side-panel at-chat-panel">
      <div className="at-chat-header">
        <div className="at-chat-title-wrap">
          <div className="at-chat-orb">
            <SparklesIcon size={16} color="#07111F" />
          </div>
          <div>
            <div className="at-chat-title">AI Board Assistant</div>
            <div className="at-chat-subtitle">{tasks.length} tasks in context</div>
          </div>
        </div>

        <button className="at-chat-collapse" onClick={onCollapse} title="Collapse assistant">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="14 18 8 12 14 6" />
          </svg>
        </button>
      </div>

      <div className="at-chat-suggestions">
        {['Summarize board', 'Create 3 missing QA cards', 'Move high priority work to To Do'].map(suggestion => (
          <button key={suggestion} onClick={() => setInput(suggestion)}>
            {suggestion}
          </button>
        ))}
      </div>

      <div ref={scrollRef} className="at-chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`at-chat-message ${msg.role}`}>
            {msg.content}
          </div>
        ))}

        {isTyping && (
          <div className="at-chat-message assistant typing">
            <div className="at-typing-indicator">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      <div className="at-chat-composer">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
          placeholder="Ask about backlog gaps, priorities, or next steps..."
          rows={3}
        />
        <button onClick={() => void handleSend()} disabled={!input.trim() || isTyping}>
          Send
        </button>
      </div>
    </aside>
  );
}
