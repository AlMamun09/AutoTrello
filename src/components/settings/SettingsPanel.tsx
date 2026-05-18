import { useState, type ChangeEvent } from 'react';
import { getSettings, saveSettings, type AppSettings } from '@/lib/settings';
import { testAiConnection } from '@/lib/ai';
import { testTrelloConnection } from '@/lib/trello';

const PROVIDERS = ['OpenAI', 'OpenRouter', 'Groq', 'LM Studio'];
const MODELS = ['gpt-4o', 'claude-3-5-sonnet', 'llama-3-70b', 'deepseek-coder'];

const PROVIDER_URLS: Record<string, string> = {
  OpenAI:     'https://api.openai.com/v1',
  OpenRouter: 'https://openrouter.ai/api/v1',
  Groq:       'https://api.groq.com/openai/v1',
  'LM Studio':'http://localhost:1234/v1',
};

function getProviderForBaseUrl(baseUrl: string) {
  if (!baseUrl) return 'OpenAI';

  try {
    const hostname = new URL(baseUrl).hostname;
    const found = Object.entries(PROVIDER_URLS).find(([, url]) => {
      try { return new URL(url).hostname === hostname; } catch { return false; }
    });
    return found ? found[0] : '';
  } catch {
    return '';
  }
}

function getModelSelection(modelName: string) {
  return MODELS.includes(modelName) ? modelName : '';
}

export function SettingsPanel({ onClose, highlightMissing }: { onClose?: () => void; highlightMissing?: boolean }) {
  const [settings, setSettings] = useState<AppSettings>(() => getSettings());
  const [showKey, setShowKey] = useState(false);
  const [activeProvider, setActiveProvider] = useState(() => getProviderForBaseUrl(getSettings().aiBaseUrl));
  const [activeModel, setActiveModel] = useState(() => getModelSelection(getSettings().aiModelName));
  const [saved, setSaved] = useState(false);

  const [testingAi, setTestingAi] = useState(false);
  const [aiMsg, setAiMsg] = useState('');
  const [testingTrello, setTestingTrello] = useState(false);
  const [trelloMsg, setTrelloMsg] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const val = e.target.value;
    setSettings({ ...settings, [name]: val });
    
    if (name === 'aiBaseUrl') {
      setActiveProvider(getProviderForBaseUrl(val));
    } else if (name === 'aiModelName') {
      setActiveModel(getModelSelection(val));
    }
  };

  const setProvider = (p: string) => {
    setActiveProvider(p);
    setSettings({ ...settings, aiBaseUrl: PROVIDER_URLS[p] });
  };

  const setModel = (m: string) => {
    setActiveModel(m);
    setSettings({ ...settings, aiModelName: m });
  };

  const handleSave = (section?: 'ai' | 'trello') => {
    saveSettings(settings); // We just save the whole object, as it's small
    setSaved(true);
    setTimeout(() => { setSaved(false); if (!section) onClose?.(); }, 800);
  };

  const handleConnectAi = async () => {
    handleSave('ai');
    setTestingAi(true);
    setAiMsg('Connecting...');
    try {
      const msg = await testAiConnection();
      setAiMsg(`Connected to ${settings?.aiModelName || 'AI'}: "${msg}"`);
    } catch (err: unknown) {
      setAiMsg(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTestingAi(false);
    }
  };

  const handleConnectTrello = async () => {
    handleSave('trello');
    setTestingTrello(true);
    setTrelloMsg('Connecting...');
    try {
      const msg = await testTrelloConnection();
      setTrelloMsg(msg);
    } catch (err: unknown) {
      setTrelloMsg(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTestingTrello(false);
    }
  };

  return (
    <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {highlightMissing && (!settings.aiApiKey || !settings.trelloApiKey) && (
        <div style={{
          background: 'rgba(96, 165, 250, 0.1)',
          border: '1px solid rgba(96, 165, 250, 0.25)',
          borderRadius: 12,
          padding: '12px 16px',
          fontSize: 13,
          color: '#93C5FD',
          lineHeight: 1.5,
        }}>
          <strong style={{ color: '#BFDBFE' }}>Welcome!</strong> Configure your AI provider and Trello integration below to start generating project backlogs and syncing boards.
          {!settings.aiApiKey && <div style={{ marginTop: 4, opacity: 0.8 }}>AI configuration is required.</div>}
          {!settings.trelloApiKey && <div style={{ marginTop: 2, opacity: 0.8 }}>Trello configuration is required for board syncing.</div>}
        </div>
      )}
      {/* AI Provider */}
      <div style={highlightMissing && !settings.aiApiKey ? { borderLeft: '3px solid var(--at-accent-blue)', paddingLeft: 12, marginLeft: -12 } : undefined}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9', marginBottom: 14 }}>AI Provider Configuration</div>

        <div className="at-form-group" style={{ marginBottom: 12 }}>
          <label className="at-label">Base URL</label>
          <input className="at-input" name="aiBaseUrl" value={settings.aiBaseUrl} onChange={handleChange} placeholder="https://api.openai.com" />
          <span style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>Compatible with OpenRouter, Groq, LM Studio, vLLM, HuggingFace</span>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div className="at-label" style={{ marginBottom: 6 }}>Provider</div>
          <div className="at-chip-group">
            {PROVIDERS.map(p => (
              <button key={p} className={`at-chip${activeProvider === p ? ' active' : ''}`} onClick={() => setProvider(p)}>{p}</button>
            ))}
          </div>
        </div>

        <div className="at-form-group" style={{ marginBottom: 12 }}>
          <label className="at-label">API Key</label>
          <div style={{ position: 'relative' }}>
            <input
              className="at-input"
              name="aiApiKey"
              type={showKey ? 'text' : 'password'}
              value={settings.aiApiKey}
              onChange={handleChange}
              placeholder="sk-..."
              style={{ paddingRight: 40 }}
            />
            <button
              onClick={() => setShowKey(v => !v)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
            >
              {showKey ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
        </div>

        <div className="at-form-group" style={{ marginBottom: 12 }}>
          <label className="at-label">Model Name</label>
          <input className="at-input" name="aiModelName" value={settings.aiModelName} onChange={handleChange} placeholder="gpt-4o" />
        </div>

        <div>
          <div className="at-label" style={{ marginBottom: 6 }}>Quick Select</div>
          <div className="at-chip-group">
            {MODELS.map(m => (
              <button key={m} className={`at-chip${activeModel === m ? ' active' : ''}`} onClick={() => setModel(m)}>{m}</button>
            ))}
          </div>
        </div>
        
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button className="at-btn at-btn-secondary" onClick={handleConnectAi} disabled={testingAi}>
            {testingAi ? <><div className="at-spinner" style={{ marginRight: 6 }}/> Connecting...</> : 'Connect AI'}
          </button>
          <button className="at-btn at-btn-ghost" onClick={() => handleSave('ai')} style={{ color: '#38BDF8' }}>
            Save AI Settings
          </button>
          {aiMsg && <div style={{ width: '100%', fontSize: 12, color: aiMsg.startsWith('Error') ? '#EF4444' : '#22C55E', marginTop: 4 }}>{aiMsg}</div>}
        </div>
      </div>

      <div className="at-section-divider" />

      {/* Trello */}
      <div style={highlightMissing && !settings.trelloApiKey ? { borderLeft: '3px solid var(--at-accent-blue)', paddingLeft: 12, marginLeft: -12 } : undefined}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9', marginBottom: 14 }}>Trello Integration</div>

        <div className="at-form-group" style={{ marginBottom: 12 }}>
          <label className="at-label">Trello API Key</label>
          <input className="at-input" name="trelloApiKey" type="password" value={settings.trelloApiKey} onChange={handleChange} placeholder="32-character API Key" />
        </div>

        <div className="at-form-group" style={{ marginBottom: 10 }}>
          <label className="at-label">Trello Token (Not Secret)</label>
          <input className="at-input" name="trelloToken" type="password" value={settings.trelloToken} onChange={handleChange} placeholder="64-character Personal Token" />
          <span style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
            Note: Use the <b>Token</b>, not the "Secret". The Secret will not work here.
          </span>
        </div>

        <a
          href="https://trello.com/app-key"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 12, color: '#2563EB', textDecoration: 'none', fontWeight: 500, display: 'inline-block', marginBottom: 4 }}
        >
          Get your Key & Token here →
        </a>

        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button className="at-btn at-btn-secondary" onClick={handleConnectTrello} disabled={testingTrello}>
            {testingTrello ? <><div className="at-spinner" style={{ marginRight: 6 }}/> Connecting...</> : 'Connect Trello'}
          </button>
          <button className="at-btn at-btn-ghost" onClick={() => handleSave('trello')} style={{ color: '#38BDF8' }}>
            Save Trello Settings
          </button>
          {trelloMsg && <div style={{ width: '100%', fontSize: 12, color: trelloMsg.startsWith('Error') ? '#EF4444' : '#22C55E', marginTop: 4 }}>{trelloMsg}</div>}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
        {onClose && (
          <button className="at-btn at-btn-ghost" onClick={onClose}>Close</button>
        )}
        <button className="at-btn at-btn-primary" onClick={() => handleSave()}>
          {saved ? '✓ Saved All!' : 'Save All'}
        </button>
      </div>
    </div>
  );
}
