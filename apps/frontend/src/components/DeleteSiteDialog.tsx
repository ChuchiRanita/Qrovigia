import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import type { Site } from "../services/sites";

interface DeleteSiteDialogProps {
  site: Site;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteSiteDialog({
  site,
  onCancel,
  onConfirm
}: DeleteSiteDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await onConfirm();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar el sitio."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <section
        className="site-modal confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        aria-describedby="delete-description"
      >
        <div className="confirm-icon">
          <AlertTriangle size={22} />
        </div>
        <h2 id="delete-title">¿Eliminar este sitio?</h2>
        <p id="delete-description">
          Se eliminará <strong>{site.name}</strong> ({site.domain}) de los
          registros. Esta acción no se puede deshacer.
        </p>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="modal-actions">
          <button className="button button-secondary" onClick={onCancel} disabled={deleting}>
            Cancelar
          </button>
          <button className="button button-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Eliminando..." : "Eliminar sitio"}
          </button>
        </div>
      </section>
    </div>
  );
}
