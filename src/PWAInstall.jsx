import { useState, useEffect } from 'react';

const PWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstall(false);
      setDeferredPrompt(null);
    }
  };

  if (!showInstall) return null;

  return (
    <div className="pwa-install-banner" style={{
      position: 'fixed',
      bottom: 20,
      left: 20,
      right: 20,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '16px',
      borderRadius: 12,
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }}>
      <span style={{flex: 1, fontWeight: 500}}>
        📱 Install Finance Tracker as App?
      </span>
      <button 
        onClick={handleInstall}
        style={{
          background: 'white',
          color: '#667eea',
          border: 'none',
          padding: '10px 20px',
          borderRadius: 8,
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Install
      </button>
      <button 
        onClick={() => setShowInstall(false)}
        style={{
          background: 'transparent',
          color: 'rgba(255,255,255,0.8)',
          border: 'none',
          padding: '10px 12px',
          cursor: 'pointer'
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default PWAInstall;

