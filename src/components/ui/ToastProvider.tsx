"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, ShieldAlert } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ConfirmOptions {
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
}

export interface AlertOptions {
  title: string;
  message: string | React.ReactNode;
  buttonText?: string;
  variant?: "info" | "warning" | "error" | "success";
}

interface ToastContextValue {
  toast: {
    success: (title: string, message?: string, duration?: number) => void;
    error: (title: string, message?: string, duration?: number) => void;
    warning: (title: string, message?: string, duration?: number) => void;
    info: (title: string, message?: string, duration?: number) => void;
  };
  confirmModal: (options: ConfirmOptions) => Promise<boolean>;
  alertModal: (options: AlertOptions) => Promise<void>;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Confirmation modal state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (val: boolean) => void;
  } | null>(null);

  // Alert modal state
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    options: AlertOptions;
    resolve: () => void;
  } | null>(null);

  // Toast removal
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Toast creation
  const addToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (title: string, message?: string, duration?: number) => addToast("success", title, message, duration),
    error: (title: string, message?: string, duration?: number) => addToast("error", title, message, duration),
    warning: (title: string, message?: string, duration?: number) => addToast("warning", title, message, duration),
    info: (title: string, message?: string, duration?: number) => addToast("info", title, message, duration),
  };

  const confirmModal = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        resolve: (val: boolean) => {
          setConfirmState(null);
          resolve(val);
        },
      });
    });
  }, []);

  const alertModal = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        options,
        resolve: () => {
          setAlertState(null);
          resolve();
        },
      });
    });
  }, []);

  // Keyboard shortcut listener (Escape to cancel)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmState?.isOpen) {
          confirmState.resolve(false);
        } else if (alertState?.isOpen) {
          alertState.resolve();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmState, alertState]);

  return (
    <ToastContext.Provider value={{ toast, confirmModal, alertModal }}>
      {children}

      {/* TOAST CONTAINER: Top-right floating stack with high z-index */}
      <div
        aria-live="polite"
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => {
          const isSuccess = t.type === "success";
          const isError = t.type === "error";
          const isWarning = t.type === "warning";
          const isInfo = t.type === "info";

          const borderClass = isSuccess
            ? "border-emerald-500/40 shadow-emerald-950/30"
            : isError
            ? "border-rose-500/40 shadow-rose-950/30"
            : isWarning
            ? "border-amber-500/40 shadow-amber-950/30"
            : "border-blue-500/40 shadow-blue-950/30";

          const icon = isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : isError ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : isWarning ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          );

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-xl bg-slate-900/95 backdrop-blur-md border ${borderClass} shadow-2xl transition-all duration-300 animate-in slide-in-from-top-3 fade-in`}
            >
              <div className="flex items-start gap-3 min-w-0">
                {icon}
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-semibold text-slate-100">{t.title}</p>
                  {t.message && (
                    <p className="text-[11px] text-slate-400 leading-relaxed break-words">{t.message}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-slate-800 shrink-0"
                aria-label="Close notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* CONFIRMATION MODAL */}
      {confirmState?.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9998] flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-black/80 space-y-4 animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center gap-3">
              {confirmState.options.variant === "danger" ? (
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                </div>
              ) : confirmState.options.variant === "warning" ? (
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5 text-blue-400" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold text-white">{confirmState.options.title}</h3>
                <p className="text-[11px] text-slate-400">Confirmation Required</p>
              </div>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed pl-1">
              {confirmState.options.message}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => confirmState.resolve(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition"
              >
                {confirmState.options.cancelText || "Cancel"}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => confirmState.resolve(true)}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-lg transition ${
                  confirmState.options.variant === "danger"
                    ? "bg-rose-600 hover:bg-rose-500 shadow-rose-950/40"
                    : confirmState.options.variant === "warning"
                    ? "bg-amber-600 hover:bg-amber-500 shadow-amber-950/40"
                    : "bg-blue-600 hover:bg-blue-500 shadow-blue-950/40"
                }`}
              >
                {confirmState.options.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALERT MODAL */}
      {alertState?.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9998] flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-black/80 space-y-4 animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center gap-3">
              {alertState.options.variant === "error" ? (
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                </div>
              ) : alertState.options.variant === "warning" ? (
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
              ) : alertState.options.variant === "success" ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5 text-blue-400" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold text-white">{alertState.options.title}</h3>
                <p className="text-[11px] text-slate-400">Notice</p>
              </div>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed pl-1">
              {alertState.options.message}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-800/80">
              <button
                type="button"
                autoFocus
                onClick={() => alertState.resolve()}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-950/40 transition"
              >
                {alertState.options.buttonText || "Understood"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
