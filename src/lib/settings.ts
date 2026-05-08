export interface AppSettings {
  aiBaseUrl: string;
  aiApiKey: string;
  aiModelName: string;
  trelloApiKey: string;
  trelloToken: string;
}

const SETTINGS_KEY = 'autotrello_settings';

export const defaultSettings: AppSettings = {
  aiBaseUrl: 'https://api.openai.com',
  aiApiKey: '',
  aiModelName: 'gpt-4o-mini',
  trelloApiKey: '',
  trelloToken: '',
};

export function getSettings(): AppSettings {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    try {
      return { ...defaultSettings, ...JSON.parse(stored) };
    } catch (e) {
      console.error('Failed to parse settings', e);
    }
  }
  return defaultSettings;
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
