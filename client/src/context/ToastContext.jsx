import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (msg) => showToast(msg, 'success');
  const error = (msg) => showToast(msg, 'error', 5000);
  const warning = (msg) => showToast(msg, 'warning', 4500);
  const info = (msg) => showToast(msg, 'info');

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl"
            style={{
              background:
                toast.type === 'success' ? 'rgba(18, 40, 22, 0.92)' :
                toast.type === 'error'   ? 'rgba(40, 14, 12, 0.92)' :
                toast.type === 'warning' ? 'rgba(40, 32, 10, 0.92)' :
                                           'rgba(20, 22, 32, 0.92)',
              border:
                toast.type === 'success' ? '1px solid rgba(52,168,83,0.30)' :
                toast.type === 'error'   ? '1px solid rgba(217,48,37,0.30)' :
                toast.type === 'warning' ? '1px solid rgba(242,153,0,0.30)' :
                                           '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.50)',
              animation: 'pageFadeIn 0.22s ease both',
            }}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4" style={{ color: '#4ade80' }} />}
              {toast.type === 'error'   && <XCircle      className="w-4 h-4" style={{ color: '#f87171' }} />}
              {toast.type === 'warning' && <AlertTriangle className="w-4 h-4" style={{ color: '#fbbf24' }} />}
              {toast.type === 'info'    && <Info         className="w-4 h-4" style={{ color: '#e879f9' }} />}
            </div>
            <div
              className="flex-1 text-xs font-medium leading-relaxed"
              style={{ color: '#d4d7e3' }}
            >
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="transition-colors p-0.5 rounded"
              style={{ color: '#3a3f50' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#9ba3b5'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#3a3f50'; }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
