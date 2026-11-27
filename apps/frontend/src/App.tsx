import { Globe2, ShieldCheck } from "lucide-react";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { SitesPage } from "./components/SitesPage";
import "./styles/app.css";

export default function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="QRO Sentinel, inicio">
          <span className="brand-mark">
            <ShieldCheck size={23} strokeWidth={2.2} />
          </span>
          <span className="brand-name">
            <strong>QRO SENTINEL</strong>
            <small>SEGURIDAD INSTITUCIONAL</small>
          </span>
        </a>

        <div className="sidebar-label">PLATAFORMA</div>
        <nav aria-label="Navegación principal">
          <a className="nav-item is-active" href="/" aria-current="page">
            <Globe2 size={18} />
            <span>Sitios protegidos</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <span className="environment-dot" />
          <span>Entorno local</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Plataforma <span>/</span> Sitios protegidos</div>
          <div className="topbar-tag">
            <ConnectionStatus />
          </div>
        </header>

        <SitesPage />
      </main>
    </div>
  );
}
