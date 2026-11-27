import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import { fetchHealthStatus } from "../services/health";

type ConnectionState =
  | { kind: "loading" }
  | { kind: "connected" }
  | { kind: "error"; message: string };

export function ConnectionStatus() {
  const [state, setState] = useState<ConnectionState>({ kind: "loading" });

  useEffect(() => {
    let active = true;

    fetchHealthStatus()
      .then(() => {
        if (active) setState({ kind: "connected" });
      })
      .catch((error: unknown) => {
        if (!active) return;

        setState({
          kind: "error",
          message:
            error instanceof Error ? error.message : "No se pudo consultar el API."
        });
      });

    return () => {
      active = false;
    };
  }, []);

  if (state.kind === "loading") {
    return (
      <div className="connection-status" role="status">
        <LoaderCircle size={18} className="status-icon is-loading" />
        <span>Comprobando API y SQLite...</span>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="connection-status is-error" role="alert">
        <CircleAlert size={18} className="status-icon" />
        <span>{state.message}</span>
      </div>
    );
  }

  return (
    <div className="connection-status is-connected" role="status">
      <CheckCircle2 size={18} className="status-icon" />
      <span>API y SQLite conectados</span>
    </div>
  );
}
