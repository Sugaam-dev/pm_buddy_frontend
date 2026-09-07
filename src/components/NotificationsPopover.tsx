"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { NotificationItem } from "@/types/api";

export function NotificationsPopover() {
  const { loading: authLoading, currentUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!api.isReady()) return; // Never fire without a bearer token
    try {
      const data = await api.getNotifications({ limit: 15 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  // Only fetch after auth is fully initialized — prevents 401 race condition
  useEffect(() => {
    if (authLoading || !currentUser) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling fallback
    return () => clearInterval(interval);
  }, [authLoading, currentUser]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 px-1.5 py-0.2 text-[9px] font-bold font-mono rounded-full bg-rose-500 text-white shadow-md shadow-rose-500/50">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[480px]">
          {/* Popover Header */}
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <Bell className="w-6 h-6 text-slate-600 mx-auto mb-2 opacity-50" />
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 transition flex items-start justify-between gap-3 ${
                    n.is_read ? "bg-transparent opacity-70 hover:opacity-100" : "bg-blue-950/10 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="mt-0.5">{getSeverityIcon(n.severity)}</div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-medium leading-snug ${n.is_read ? "text-slate-300" : "text-white"}`}>
                        {n.title}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        <span className="font-mono text-[9px] uppercase px-1 rounded bg-slate-800 text-slate-400">
                          {n.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!n.is_read && (
                    <button
                      onClick={(e) => handleMarkRead(n.id, e)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition shrink-0"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40 text-center text-[10px] text-slate-500">
            Realtime in-app notification center
          </div>
        </div>
      )}
    </div>
  );
}
