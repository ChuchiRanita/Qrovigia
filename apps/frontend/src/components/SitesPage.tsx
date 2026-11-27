import { useCallback, useEffect, useState } from "react";
import {
  CircleAlert,
  Filter,
  Plus,
  Search,
  ShieldCheck,
  X
} from "lucide-react";
import {
  changeSiteStatus,
  createSite,
  deleteSite,
  fetchSiteStats,
  fetchSites,
  updateSite,
  type Site,
  type SiteInput,
  type SiteStats,
  type SiteStatus
} from "../services/sites";
import { DeleteSiteDialog } from "./DeleteSiteDialog";
import { SiteCard } from "./SiteCard";
import { SiteFormModal } from "./SiteFormModal";
import { SiteStatsCards } from "./SiteStatsCards";

type StatusFilter = SiteStatus | "all";
type SiteFormState = { kind: "create" } | { kind: "edit"; site: Site };

const statusFilterOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Todos los estados" },
  { value: "pending_verification", label: "Pendiente de verificación" },
  { value: "active", label: "Activo" },
  { value: "paused", label: "Pausado" },
  { value: "configuration_error", label: "Error de configuración" }
];

export function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SiteFormState | null>(null);
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const [nextSites, nextStats] = await Promise.all([
        fetchSites(search, statusFilter),
        fetchSiteStats()
      ]);
      setSites(nextSites);
      setStats(nextStats);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar los sitios."
      );
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    setLoading(true);
    void refresh();
  }, [refresh]);

  async function handleSave(input: SiteInput) {
    if (form?.kind === "edit") {
      await updateSite(form.site.id, input);
    } else {
      await createSite(input);
    }
    setForm(null);
    await refresh();
  }

  async function handleStatusChange(site: Site, status: "paused" | "active") {
    setError(null);
    try {
      await changeSiteStatus(site.id, status);
      await refresh();
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "No se pudo actualizar el estado del sitio."
      );
    }
  }

  async function handleDelete() {
    if (!siteToDelete) return;
    await deleteSite(siteToDelete.id);
    setSiteToDelete(null);
    await refresh();
  }

  return (
    <section className="sites-page">
      <div className="sites-heading">
        <div>
          <div className="eyebrow">
            <ShieldCheck size={15} />
            <span>ADMINISTRACIÓN</span>
          </div>
          <h1>Sitios protegidos</h1>
          <p className="intro">
            Administra los sitios institucionales registrados en la plataforma.
            La verificación de propiedad y los análisis se habilitarán en una fase posterior.
          </p>
        </div>
        <button className="button button-primary add-site-button" onClick={() => setForm({ kind: "create" })}>
          <Plus size={17} /> Agregar sitio
        </button>
      </div>

      <SiteStatsCards stats={stats} />

      <div className="sites-toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            aria-label="Buscar por nombre o dominio"
            placeholder="Buscar por nombre o dominio..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch("")} aria-label="Limpiar búsqueda">
              <X size={15} />
            </button>
          )}
        </div>
        <label className="filter-field">
          <Filter size={16} />
          <select
            aria-label="Filtrar por estado"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          >
            {statusFilterOptions.map((option) => (
              <option value={option.value} key={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <span className="result-count">
          {loading ? "Cargando..." : `${sites.length} ${sites.length === 1 ? "sitio" : "sitios"}`}
        </span>
      </div>

      {error && (
        <div className="sites-error" role="alert">
          <CircleAlert size={18} />
          <span>{error}</span>
          <button className="button button-secondary" onClick={() => { setLoading(true); void refresh(); }}>
            Reintentar
          </button>
        </div>
      )}

      <div className="sites-list" aria-live="polite">
        {loading ? (
          <div className="sites-loading">
            <span className="loading-spinner" />
            <span>Cargando sitios registrados...</span>
          </div>
        ) : sites.length > 0 ? (
          sites.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              onEdit={(selectedSite) => setForm({ kind: "edit", site: selectedSite })}
              onStatusChange={handleStatusChange}
              onDelete={setSiteToDelete}
            />
          ))
        ) : (
          <div className="sites-empty">
            <div className="empty-icon"><ShieldCheck size={24} /></div>
            <h2>{search || statusFilter !== "all" ? "No se encontraron sitios" : "Aún no hay sitios registrados"}</h2>
            <p>
              {search || statusFilter !== "all"
                ? "Prueba con otros términos o cambia el filtro de estado."
                : "Agrega un sitio institucional para iniciar su administración."}
            </p>
            {!search && statusFilter === "all" && (
              <button className="button button-primary" onClick={() => setForm({ kind: "create" })}>
                <Plus size={16} /> Agregar primer sitio
              </button>
            )}
          </div>
        )}
      </div>

      <footer className="page-footer">
        QRO Sentinel <span>·</span> Plataforma externa de ciberseguridad institucional
      </footer>

      {form && (
        <SiteFormModal
          site={form.kind === "edit" ? form.site : null}
          onClose={() => setForm(null)}
          onSave={handleSave}
        />
      )}
      {siteToDelete && (
        <DeleteSiteDialog
          site={siteToDelete}
          onCancel={() => setSiteToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </section>
  );
}
