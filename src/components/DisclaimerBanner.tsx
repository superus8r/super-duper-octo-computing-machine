import { useEffect, useState } from 'react';

const STORAGE_KEY = 'dismissedDisclaimer';

const DISCLAIMER_TEXT = `Experimental app provided "as is," without warranties or guarantees of any kind—express or implied. You are solely responsible for any use and data entered. The author assumes no liability for losses or damages arising from use. Do not use for critical or safety-related purposes.`;

export function DisclaimerBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      setVisible(dismissed !== 'true');
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore storage errors
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="disclaimer-banner" role="note" aria-label="Experimental disclaimer">
      <div className="disclaimer-icon" aria-hidden>⚠️</div>
      <div className="disclaimer-content">
        <strong>Disclaimer:</strong> {DISCLAIMER_TEXT}
      </div>
      <div className="disclaimer-actions">
        <button type="button" onClick={dismiss} aria-label="Dismiss disclaimer">Dismiss</button>
      </div>
    </div>
  );
}