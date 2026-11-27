import { useState, type FormEvent } from "react";
import { CircleAlert, X } from "lucide-react";
import type { Site, SiteEnvironment, SiteInput } from "../services/sites";

interface SiteFormModalProps {
  site: Site | null;
  onClose: () => void;
  onSave: (input: SiteInput) => Promise<void>;
}

function isLocalHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "::1" ||
    (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) && host.startsWith("127."))
  );
}

function validateUrl(value: string, environment: SiteEnvironment): string | null {
  try {
    const url = new URL(value);
    if (url.username || url.password) {
      return "La URL no puede incluir credenciales.";
    }
    if (url.protocol === "https:") return null;
    if (
      url.protocol === "http:" &&
      environment === "development" &&
      isLocalHost(url.hostname)
    ) {
      return null;
    }
  } catch {
    return "Ingresa una URL completa y válida.";
  }

  return "Usa HTTPS. HTTP solo se permite para destinos locales en Desarrollo.";
}

export function SiteFormModal({ site, onClose, onSave }: SiteFormModalProps) {
  const [name, setName] = useState(site?.name ?? "");
  const [url, setUrl] = useState(site?.url ?? "");
  const [environment, setEnvironment] = useState<SiteEnvironment>(
    site?.environment ?? "production"
  );
  const [description, setDescription] = useState(site?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const urlError = validateUrl(url.trim(), environment);
    if (urlError) {
      setError(urlError);
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        url: url.trim(),
        environment,
        description: description.trim()
      });
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar el sitio."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !saving) onClose();
    }}>
      <section
        className="site-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-form-title"
      >
        <div className="modal-heading">
          <div>
            <span className="modal-eyebrow">{site ? "ACTUALIZAR REGISTRO" : "NUEVO REGISTRO"}</span>
            <h2 id="site-form-title">{site ? "Editar sitio" : "Agregar sitio"}</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario"
            disabled={saving}
          >
            <X size={19} />
          </button>
        </div>

        <form className="site-form" onSubmit={handleSubmit}>
          <label>
            Nombre del sitio <span className="required-mark">*</span>
            <input
              autoFocus
              required
              maxLength={150}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Portal institucional"
            />
          </label>

          <label>
            URL completa <span className="required-mark">*</span>
            <input
              required
              type="url"
              maxLength={2048}
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://www.institucion.gob.mx"
            />
            <small>HTTPS es obligatorio excepto en destinos locales de Desarrollo.</small>
          </label>

          <label>
            Tipo de entorno <span className="required-mark">*</span>
            <select
              value={environment}
              onChange={(event) => setEnvironment(event.target.value as SiteEnvironment)}
            >
              <option value="production">Producción</option>
              <option value="testing">Pruebas</option>
              <option value="development">Desarrollo</option>
            </select>
          </label>

          <label>
            Descripción <span className="optional-label">Opcional</span>
            <textarea
              rows={3}
              maxLength={2000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Información adicional sobre este sitio"
            />
          </label>

          {error && (
            <div className="form-error" role="alert">
              <CircleAlert size={17} />
              <span>{error}</span>
            </div>
          )}

          <div className="modal-actions">
            <button className="button button-secondary" type="button" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? "Guardando..." : site ? "Guardar cambios" : "Registrar sitio"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
