import React from 'react';
import ReactDOM from 'react-dom/client';
import CommandPalette from './assets/index-BuQ2uKDs.js'; // adjust path/hash

// Make sure we only ever mount once
if (!window.__ghostUI_root) {
  const el = document.createElement('div');
  el.id = '__ghostUI_root';
  document.documentElement.appendChild(el);
  window.__ghostUI_root = el;

  window.mountGhostUI = () => {
    // Toggle by mounting/unmounting
    if (window.__ghostUI_mounted) {
      ReactDOM.unmountComponentAtNode(el);
      window.__ghostUI_mounted = false;
    } else {
      ReactDOM.createRoot(el).render(<CommandPalette />);
      window.__ghostUI_mounted = true;
    }
  };
}
