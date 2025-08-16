import { useEffect, useState } from 'react';
import { TopBar } from '../../components/TopBar';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';
import { useLiveQuery } from '../../hooks/useLiveQuery';
import { getLists, getSettings, updateSettings } from '../../lib/db';
import { setTheme } from '../../lib/theme';
import type { ProfileSettings, ThemePref } from '../../lib/types';

const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

const THEMES: { value: ThemePref; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'system', label: 'System', icon: '⚙️' },
];

export function ProfilePage() {
  const [settings, setSettingsState] = useState<ProfileSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { data: lists } = useLiveQuery(getLists, [], 'lists-changed');

  useEffect(() => {
    getSettings().then((data) => {
      setSettingsState(data);
      setLoading(false);
    });
  }, []);

  const handleSettingsChange = async (updates: Partial<ProfileSettings>) => {
    if (!settings) return;
    
    const newSettings = { ...settings, ...updates };
    setSettingsState(newSettings);
    await updateSettings(newSettings);
    
    // Apply theme change immediately
    if (updates.theme) {
      setTheme(updates.theme);
    }
  };

  // Calculate statistics
  const stats = {
    totalLists: lists?.length || 0,
    activeLists: lists?.filter(list => !list.deletedAt).length || 0,
  };

  if (loading || !settings) {
    return (
      <>
        <TopBar title="Profile" />
        <div className="page-content">
          <DisclaimerBanner />
          <div className="text-center">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Profile" />
      <div className="page-content">
        <DisclaimerBanner />
        <div className="space-y-6">
          
          {/* Statistics */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.totalLists}</div>
                <div className="text-sm text-fg-muted">Total Lists</div>
              </div>
              <div className="text-center p-3 bg-bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.activeLists}</div>
                <div className="text-sm text-fg-muted">Active Lists</div>
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Appearance</h2>
            
            <div className="form-group">
              <label htmlFor="theme-select" className="form-label">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {THEMES.map((theme) => (
                  <button
                    key={theme.value}
                    type="button"
                    className={`theme-option ${
                      settings.theme === theme.value ? 'selected' : ''
                    }`}
                    onClick={() => handleSettingsChange({ theme: theme.value })}
                    aria-pressed={settings.theme === theme.value}
                  >
                    <span className="text-2xl mb-1">{theme.icon}</span>
                    <span className="text-sm">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* General Settings */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">General Settings</h2>
            
            <div className="form-group">
              <label htmlFor="currency-select" className="form-label">
                Default Currency
              </label>
              <select
                id="currency-select"
                className="form-select"
                value={settings.currency}
                onChange={(e) => handleSettingsChange({ currency: e.target.value })}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tax-rate" className="form-label">
                Tax Rate (%)
              </label>
              <input
                id="tax-rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                className="form-input"
                value={(settings.taxRate * 100).toFixed(1)}
                onChange={(e) => 
                  handleSettingsChange({ 
                    taxRate: parseFloat(e.target.value) / 100 
                  })
                }
              />
            </div>

            <div className="form-group">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={settings.hapticsEnabled}
                  onChange={(e) => 
                    handleSettingsChange({ 
                      hapticsEnabled: e.target.checked 
                    })
                  }
                />
                <span className="form-label">Enable Haptic Feedback</span>
              </label>
              <p className="text-sm text-fg-muted mt-1">
                Vibrate when interacting with buttons (on supported devices)
              </p>
            </div>
          </div>

          {/* About */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <div className="space-y-2 text-sm text-fg-muted">
              <div className="flex justify-between">
                <span>Version</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Build Type</span>
                <span>PWA</span>
              </div>
              <div className="flex justify-between">
                <span>Storage</span>
                <span>IndexedDB + LocalStorage</span>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-2">Legal</h2>
            <p className="text-sm text-fg-muted">
              Experimental app provided "as is," without warranties or guarantees of any kind—express or implied.
              You are solely responsible for any use and data entered. The author assumes no liability for losses or
              damages arising from use. Do not use for critical or safety-related purposes.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}