import React, { useEffect, useState } from 'react';

// 1. The Visual UI Component
export default function Toast({ message, type, onClose, visible }) {
  // useEffect is a React hook that runs "side-effects" (like timers or API calls)
  useEffect(() => {
    // If the toast just appeared on screen, start a 3-second timer
    if (visible) {
      const timer = setTimeout(() => {
        onClose(); // Automatically close it after 3000ms
      }, 3000);
      
      // Cleanup function: If the user manually clicks the 'X' button before 3 seconds is up,
      // this clears the timer so it doesn't accidentally trigger later.
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]); // This tells React to re-run this effect ONLY when 'visible' changes

  // If the toast is not supposed to be visible, literally render nothing
  if (!visible) return null;

  // Dynamically choose the CSS class based on the type of alert
  let bgClass = "toast-info";
  if (type === 'success') bgClass = "toast-success";
  if (type === 'error') bgClass = "toast-error";

  return (
    <>
      <div className={`toast-container ${bgClass}`}>
        <span className="toast-message">{message}</span>
        <button className="toast-close-btn" onClick={onClose}>&times;</button>
      </div>

      <style>{`
        .toast-container {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 9999;
          padding: 1rem 1.5rem;
          border-radius: var(--radius);
          width: 300px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
          animation: slideIn 0.3s ease-out; /* Pop in from the right */
        }

        .toast-message {
          color: white;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .toast-close-btn {
          background: transparent;
          border: none;
          color: white;
          font-size: 1.5rem;
          line-height: 1;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        
        .toast-close-btn:hover {
          opacity: 1;
        }

        /* Color Variations */
        .toast-success {
          background: #166534; /* Dark Green */
          border: 1px solid var(--accent-green);
        }

        .toast-error {
          background: #7f1d1d; /* Dark Red */
          border: 1px solid var(--accent-red);
        }

        .toast-info {
          background: #1e3a5f; /* Dark Blue */
          border: 1px solid var(--accent-blue);
        }

        /* Keyframe animation to make it slide in beautifully */
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}

// 2. The Logic Hook
// By building this hook, we save ourselves from writing the same 10 lines of code on every page!
export function useToast() {
  // Store the toast's internal memory (what does it say? is it visible?)
  const [toastConfig, setToastConfig] = useState({
    message: '',
    type: 'info',
    visible: false
  });

  // A simple function to trigger the toast
  const showToast = (message, type = 'info') => {
    setToastConfig({ message, type, visible: true });
  };

  // A simple function to hide the toast
  const closeToast = () => {
    setToastConfig(prev => ({ ...prev, visible: false }));
  };

  // We bundle all the props together so the parent component can just inject them easily
  const toastProps = {
    message: toastConfig.message,
    type: toastConfig.type,
    visible: toastConfig.visible,
    onClose: closeToast
  };

  // Hand the tools back to whatever page asked for them
  return { toastProps, showToast };
}
