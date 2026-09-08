"use client";

import React, { useEffect, useState } from "react";
import { Bell, Check, CheckCheck, Clock, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { RoleGuard } from "@/components/RouteGuard";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  is_read: boolean;
  link_url?: string;
  action_link?: string;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications({ unread_only: unreadOnly, limit: 50 });
      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [unreadOnly]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
    }
  };

  return (
    <RoleGuard requiredPermission="project.read">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-blue-400" />
              Operational Notifications & Alerts
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time audit log signals, SLA threshold warnings, and gate approval escalations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setUnreadOnly(!unreadOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                unreadOnly
                  ? "bg-blue-600 text-white border-blue-500"
                  : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
              }`}
            >
              {unreadOnly ? "Showing Unread" : "Show All"}
            </button>
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Mark all read</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-xs text-slate-500 font-mono">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <Bell className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-200">No Notifications</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You are completely caught up! No unread operational events or SLA breach alarms.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition flex items-start justify-between gap-4 ${
                  notif.is_read
                    ? "bg-slate-950/60 border-slate-850 opacity-80"
                    : "bg-slate-900 border-blue-500/30 shadow-lg shadow-blue-950/20"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-white">{notif.title}</span>
                    <span
                      className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border ${
                        notif.severity === "critical"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                          : notif.severity === "warning"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      }`}
                    >
                      {notif.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 pt-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(notif.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {(notif.link_url || notif.action_link) && (
                    <a
                      href={notif.link_url || notif.action_link}
                      className="p-1.5 text-blue-400 hover:text-blue-300 rounded-lg hover:bg-slate-800 transition"
                      title="Open link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
