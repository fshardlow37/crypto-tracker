import { useState, useEffect } from 'react';

export default function Titlebar() {
  const [version, setVersion] = useState('');

  useEffect(() => {
    window.electronAPI?.getAppVersion().then(setVersion);
  }, []);

  return (
    <div className="titlebar">
      <div className="titlebar-info">
        <span>Crypto Tracker</span>
        {version && <span className="titlebar-version">v{version}</span>}
      </div>
      <button
        className="titlebar-close"
        onClick={() => window.electronAPI?.closeWindow()}
      >
        ✕
      </button>
    </div>
  );
}
