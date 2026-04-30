"use client";

import { useMemo, useState, useCallback } from "react";
import { AnalysisHistoryItem } from "@/types/analysis";
import { generateNotifications, dismissNotification, RiskNotification } from "@/lib/notifications";

interface NotificationCenterProps {
  history: AnalysisHistoryItem[];
}

export function NotificationCenter({ history }: NotificationCenterProps) {
  const [dismissedInSession, setDismissedInSession] = useState<string[]>([]);

  const notifications = useMemo(() => {
    const all = generateNotifications(history);
    return all.filter((n) => !dismissedInSession.includes(n.id));
  }, [history, dismissedInSession]);

  const handleDismiss = useCallback((notificationId: string) => {
    dismissNotification(notificationId);
    setDismissedInSession((prev) => [...prev, notificationId]);
  }, []);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
          <svg
            className="h-4 w-4 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          Alertas ({notifications.length})
        </h3>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onDismiss={handleDismiss}
          />
        ))}
      </div>
    </div>
  );
}

interface NotificationCardProps {
  notification: RiskNotification;
  onDismiss: (id: string) => void;
}

function NotificationCard({ notification, onDismiss }: NotificationCardProps) {
  const severityStyles = {
    critical: {
      border: "border-rose-500/30",
      bg: "bg-rose-500/10",
      icon: "text-rose-400",
      title: "text-rose-300",
    },
    warning: {
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
      icon: "text-amber-400",
      title: "text-amber-300",
    },
    info: {
      border: "border-teal-500/30",
      bg: "bg-teal-500/10",
      icon: "text-teal-400",
      title: "text-teal-300",
    },
  };

  const styles = severityStyles[notification.severity];

  return (
    <div
      className={`relative rounded-xl border ${styles.border} ${styles.bg} p-3`}
    >
      <button
        onClick={() => onDismiss(notification.id)}
        className="absolute right-2 top-2 rounded-full p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Dispensar notificacao"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className={`mt-0.5 ${styles.icon}`}>
          {notification.severity === "critical" ? (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ) : notification.severity === "warning" ? (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>

        <div className="flex-1">
          <p className={`text-sm font-semibold ${styles.title}`}>
            {notification.title}
          </p>
          <p className="mt-1 text-xs text-slate-300">{notification.message}</p>

          {notification.contractAddress && (
            <p className="mt-2 font-mono text-xs text-slate-400">
              {notification.contractAddress}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Badge para mostrar contagem de notificacoes no header/nav
interface NotificationBadgeProps {
  history: AnalysisHistoryItem[];
}

export function NotificationBadge({ history }: NotificationBadgeProps) {
  const notifications = useMemo(() => generateNotifications(history), [history]);

  if (notifications.length === 0) {
    return null;
  }

  const hasCritical = notifications.some((n) => n.severity === "critical");

  return (
    <span
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
        hasCritical
          ? "bg-rose-500 text-white"
          : "bg-amber-500 text-slate-900"
      }`}
    >
      {notifications.length}
    </span>
  );
}
