import { AlertTriangle, CircleCheck, CircleDashed, Pause } from "lucide-react";
import type { SiteStatus } from "../services/sites";

const statusLabels: Record<SiteStatus, string> = {
  pending_verification: "Pendiente de verificación",
  active: "Activo",
  paused: "Pausado",
  configuration_error: "Error de configuración"
};

const statusIcons = {
  pending_verification: CircleDashed,
  active: CircleCheck,
  paused: Pause,
  configuration_error: AlertTriangle
};

export function SiteStatusBadge({ status }: { status: SiteStatus }) {
  const Icon = statusIcons[status];

  return (
    <span className={`site-status status-${status}`} title={statusLabels[status]}>
      <Icon size={14} />
      {statusLabels[status]}
    </span>
  );
}
