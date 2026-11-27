import { useState } from "react";
import {
  Clock3,
  Ellipsis,
  FilePenLine,
  Globe2,
  Pause,
  Play,
  ScanLine,
  Trash2
} from "lucide-react";
import type { Site } from "../services/sites";
import { SiteStatusBadge } from "./SiteStatusBadge";

interface SiteCardProps {
  site: Site;
  onEdit: (site: Site) => void;
  onStatusChange: (site: Site, status: "paused" | "active") => void;
  onDelete: (site: Site) => void;
}

const environmentLabels = {
  production: "Producción",
  testing: "Pruebas",
  development: "Desarrollo"
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeZone: "UTC"
  }).format(new Date(value));
}

export function SiteCard({
  site,
  onEdit,
  onStatusChange,
  onDelete
}: SiteCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article className="site-card">
      <div className="site-card-main">
        <div className="site-avatar">
          <Globe2 size={20} />
        </div>
        <div className="site-identity">
          <div className="site-name-line">
            <h3>{site.name}</h3>
            <SiteStatusBadge status={site.status} />
          </div>
          <div className="site-domain">
            <span>{site.domain}</span>
            {site.url !== `https://${site.domain}/` && (
              <span className="site-url-detail">{site.url}</span>
            )}
          </div>
        </div>
        <div className="site-menu-wrap">
          <button
            className="icon-button site-menu-trigger"
            type="button"
            aria-label={`Acciones de ${site.name}`}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Ellipsis size={19} />
          </button>
          {menuOpen && (
            <div className="site-action-menu" role="menu">
              <button role="menuitem" onClick={() => { setMenuOpen(false); onEdit(site); }}>
                <FilePenLine size={15} /> Editar información
              </button>
              {site.status === "paused" ? (
                <button role="menuitem" onClick={() => { setMenuOpen(false); onStatusChange(site, "active"); }}>
                  <Play size={15} /> Reactivar sitio
                </button>
              ) : (
                <button role="menuitem" onClick={() => { setMenuOpen(false); onStatusChange(site, "paused"); }}>
                  <Pause size={15} /> Pausar sitio
                </button>
              )}
              <div className="menu-divider" />
              <button className="menu-danger" role="menuitem" onClick={() => { setMenuOpen(false); onDelete(site); }}>
                <Trash2 size={15} /> Eliminar sitio
              </button>
            </div>
          )}
        </div>
      </div>

      {site.description && <p className="site-description">{site.description}</p>}

      <div className="site-card-footer">
        <div className="site-meta">
          <span className={`environment-pill environment-${site.environment}`}>
            {environmentLabels[site.environment]}
          </span>
          <span className="site-meta-item">
            <Clock3 size={14} /> Registrado {formatDate(site.created_at)}
          </span>
        </div>
        <div className="site-scan-state">
          <ScanLine size={14} />
          {site.last_scan_at ? (
            <span>Último análisis {formatDate(site.last_scan_at)}</span>
          ) : (
            <span>Sin análisis</span>
          )}
        </div>
      </div>
    </article>
  );
}
