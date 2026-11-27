import { CircleCheck, Globe2, ShieldQuestion } from "lucide-react";
import type { SiteStats } from "../services/sites";

interface SiteStatsCardsProps {
  stats: SiteStats | null;
}

export function SiteStatsCards({ stats }: SiteStatsCardsProps) {
  const items = [
    { label: "Sitios registrados", value: stats?.total, icon: Globe2, tone: "blue" },
    { label: "Sitios activos", value: stats?.active, icon: CircleCheck, tone: "green" },
    {
      label: "Pendientes de verificación",
      value: stats?.pendingVerification,
      icon: ShieldQuestion,
      tone: "amber"
    }
  ];

  return (
    <div className="site-stats">
      {items.map(({ label, value, icon: Icon, tone }) => (
        <article className="site-stat-card" key={label}>
          <div className={`stat-icon tone-${tone}`}>
            <Icon size={19} />
          </div>
          <div>
            <span className="stat-label">{label}</span>
            <strong className="stat-value">{value ?? "—"}</strong>
          </div>
        </article>
      ))}
    </div>
  );
}
