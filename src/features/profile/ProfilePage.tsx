import { useEffect, useState } from 'react';
import { TopBar } from '../../components/TopBar';
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
        <main className="container-page py-4">
          <div className="text-center">Loading...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar title="Profile" />
      <main className="container-page py-4">
        <div className="space-y-6">
          
          {/* Statistics */}
          <div className="card p-4">
            <h2 className="mb-4 text-xl font-semibold">Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-slate-100 p-3 text-center dark:bg-neutral-800">
                <div className="text-2xl font-bold text-blue-600">{stats.totalLists}</div>
                <div className="muted">Total Lists</div>
              </div>
              <div className="rounded-lg bg-slate-100 p-3 text-center dark:bg-neutral-800">
                <div className="text-2xl font-bold text-blue-600">{stats.activeLists}</div>
                <div className="muted">Active Lists</div>
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="card p-4">
            <h2 className="mb-4 text-xl font-semibold">Appearance</h2>
            
            <div className="space-y-2">
              <label htmlFor="theme-select" className="text-sm font-medium">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {THEMES.map((theme) => (
                  <button
                    key={theme.value}
                    type="button"
                    className={`flex min-h-20 flex-col items-center justify-center rounded-lg border-2 p-3 transition-all ${
                      settings.theme === theme.value 
                        ? 'border-blue-600 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-400' 
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:bg-neutral-800'
                    }`}
                    onClick={() => handleSettingsChange({ theme: theme.value })}
                    aria-pressed={settings.theme === theme.value}
                  >
                    <span className="mb-1 text-2xl">{theme.icon}</span>
                    <span className="text-sm">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* General Settings */}
          <div className="card p-4">
            <h2 className="mb-4 text-xl font-semibold">General Settings</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="currency-select" className="text-sm font-medium">
                  Default Currency
                </label>
                <select
                  id="currency-select"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900"
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

              <div className="space-y-2">
                <label htmlFor="tax-rate" className="text-sm font-medium">
                  Tax Rate (%)
                </label>
                <input
                  id="tax-rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900"
                  value={(settings.taxRate * 100).toFixed(1)}
                  onChange={(e) => 
                    handleSettingsChange({ 
                      taxRate: parseFloat(e.target.value) / 100 
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="rounded border-slate-200 text-blue-600 focus:ring-blue-500 dark:border-neutral-800"
                    checked={settings.hapticsEnabled}
                    onChange={(e) => 
                      handleSettingsChange({ 
                        hapticsEnabled: e.target.checked 
                      })
                    }
                  />
                  <span className="text-sm font-medium">Enable Haptic Feedback</span>
                </label>
                <p className="muted">
                  Vibrate when interacting with buttons (on supported devices)
                </p>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="card p-4">
            <h2 className="mb-4 text-xl font-semibold">About</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="muted">Version</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="muted">Build Type</span>
                <span>PWA</span>
              </div>
              <div className="flex justify-between">
                <span className="muted">Storage</span>
                <span>IndexedDB + LocalStorage</span>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div className="card p-4">
            <h2 className="mb-2 text-xl font-semibold">Legal</h2>
            <p className="muted text-sm">
              Experimental app provided "as is," without warranties or guarantees of any kind—express or implied.
              You are solely responsible for any use and data entered. The author assumes no liability for losses or
              damages arising from use. Do not use for critical or safety-related purposes.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}