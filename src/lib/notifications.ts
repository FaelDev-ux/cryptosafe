import { AnalysisHistoryItem } from "@/types/analysis";

const NOTIFICATIONS_KEY = "cryptosafe_notifications";
const DISMISSED_KEY = "cryptosafe_notifications_dismissed";

export interface RiskNotification {
  id: string;
  type: "repeated_contract" | "high_risk_pattern" | "unlimited_approval_warning" | "exposure_alert";
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  contractAddress?: string;
  createdAt: string;
  data?: Record<string, unknown>;
}

function isClient() {
  return typeof window !== "undefined";
}

function getDismissedIds(): string[] {
  if (!isClient()) return [];
  const raw = window.localStorage.getItem(DISMISSED_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function saveDismissedIds(ids: string[]): void {
  if (!isClient()) return;
  window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids));
}

export function dismissNotification(notificationId: string): void {
  const dismissed = getDismissedIds();
  if (!dismissed.includes(notificationId)) {
    saveDismissedIds([...dismissed, notificationId]);
  }
}

export function clearDismissedNotifications(): void {
  if (!isClient()) return;
  window.localStorage.removeItem(DISMISSED_KEY);
}

export function generateNotifications(history: AnalysisHistoryItem[]): RiskNotification[] {
  if (history.length === 0) return [];

  const notifications: RiskNotification[] = [];
  const dismissedIds = getDismissedIds();

  // 1. Detectar contratos repetidos com alto risco
  const contractAnalyses = new Map<string, AnalysisHistoryItem[]>();
  history.forEach((item) => {
    const address = item.submittedData.contractAddress.toLowerCase();
    if (!contractAnalyses.has(address)) {
      contractAnalyses.set(address, []);
    }
    contractAnalyses.get(address)!.push(item);
  });

  contractAnalyses.forEach((analyses, address) => {
    const highRiskCount = analyses.filter(
      (a) => a.riskLevel === "HIGH" || a.riskLevel === "CRITICAL"
    ).length;

    if (analyses.length >= 2 && highRiskCount >= 2) {
      const notificationId = `repeated_${address}`;
      if (!dismissedIds.includes(notificationId)) {
        notifications.push({
          id: notificationId,
          type: "repeated_contract",
          title: "Contrato repetido de alto risco",
          message: `Voce analisou o contrato ${address.slice(0, 8)}...${address.slice(-6)} ${analyses.length} vezes. ${highRiskCount} analises indicaram risco alto ou critico.`,
          severity: "warning",
          contractAddress: address,
          createdAt: new Date().toISOString(),
          data: { analysisCount: analyses.length, highRiskCount },
        });
      }
    }
  });

  // 2. Alertar sobre muitas aprovacoes ilimitadas
  const unlimitedApprovals = history.filter(
    (h) => h.submittedData.unlimitedApproval
  );
  if (unlimitedApprovals.length >= 3) {
    const notificationId = "unlimited_approvals_warning";
    if (!dismissedIds.includes(notificationId)) {
      notifications.push({
        id: notificationId,
        type: "unlimited_approval_warning",
        title: "Muitas aprovacoes ilimitadas",
        message: `Voce tem ${unlimitedApprovals.length} transacoes com aprovacao ilimitada. Isso pode expor sua carteira a riscos desnecessarios.`,
        severity: "warning",
        createdAt: new Date().toISOString(),
        data: { count: unlimitedApprovals.length },
      });
    }
  }

  // 3. Alertar sobre alta exposicao a risco
  const criticalCount = history.filter((h) => h.riskLevel === "CRITICAL").length;
  const highCount = history.filter((h) => h.riskLevel === "HIGH").length;
  const riskExposure = ((criticalCount + highCount) / history.length) * 100;

  if (riskExposure >= 50 && history.length >= 5) {
    const notificationId = "high_exposure_alert";
    if (!dismissedIds.includes(notificationId)) {
      notifications.push({
        id: notificationId,
        type: "exposure_alert",
        title: "Alta exposicao a riscos",
        message: `${Math.round(riskExposure)}% das suas analises indicam risco alto ou critico. Revise suas aprovacoes ativas.`,
        severity: "critical",
        createdAt: new Date().toISOString(),
        data: { riskExposure: Math.round(riskExposure), criticalCount, highCount },
      });
    }
  }

  // 4. Detectar padrao de operacoes suspeitas recentes
  const recentHistory = history.slice(0, 5);
  const recentCritical = recentHistory.filter((h) => h.riskLevel === "CRITICAL").length;
  if (recentCritical >= 3) {
    const notificationId = "recent_critical_pattern";
    if (!dismissedIds.includes(notificationId)) {
      notifications.push({
        id: notificationId,
        type: "high_risk_pattern",
        title: "Padrao de risco detectado",
        message: `${recentCritical} das suas ultimas 5 analises sao de risco critico. Recomendamos pausar operacoes e revisar.`,
        severity: "critical",
        createdAt: new Date().toISOString(),
        data: { recentCritical },
      });
    }
  }

  // Ordenar por severidade (critical primeiro)
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  notifications.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return notifications;
}
