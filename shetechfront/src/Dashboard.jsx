import { useState, useEffect } from "react";
import axios from "axios";
import Formations from "./Formations";
import AdminDashboard from "./AdminDashboard";
import Projets from "./Projets";
import Community from "./Community";
import Certificats from "./Certificats";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const MENU = [
  { id: "dashboard", label: "Tableau de bord" },
  { id: "formation", label: "Formations" },
  { id: "projets", label: "Mes projets" },
  { id: "communaute", label: "Communauté" },
  { id: "certificats", label: "Certificats" },
];

function ProgressBar({ value, color = "#C45C7A" }) {
  return (
    <div className="dash-progress">
      <span style={{ width: `${Math.min(Number(value) || 0, 100)}%`, background: color }} />
    </div>
  );
}

function KpiCard({ value, label, sub, tone = "rose", delay = 0 }) {
  return (
    <article className={`dash-kpi dash-kpi--${tone}`} style={{ animationDelay: `${delay}ms` }}>
      <strong>{value}</strong>
      <span>{label}</span>
      <small>{sub}</small>
    </article>
  );
}

export default function Dashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [progression, setProgression] = useState([]);
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const handleAuthError = (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) onLogout();
    return { data: [] };
  };

  const chargerDonneesDashboard = () => {
    if (!token) {
      onLogout();
      return;
    }

    setLoading(true);
    Promise.all([
      axios.get(`${API}/progression`, { headers }).catch(handleAuthError),
      axios.get(`${API}/projets`, { headers }).catch(handleAuthError),
    ]).then(([prog, proj]) => {
      setProgression(prog.data || []);
      setProjets(proj.data || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (activePage === "dashboard") chargerDonneesDashboard();
  }, [activePage]);

  if (activePage === "formation") return <Formations onBack={() => setActivePage("dashboard")} />;
  if (activePage === "communaute") return <Community user={user} onBack={() => setActivePage("dashboard")} />;
  if (activePage === "admin") return <AdminDashboard onBack={() => setActivePage("dashboard")} />;
  if (activePage === "projets") return <Projets onBack={() => setActivePage("dashboard")} onLogout={onLogout} />;
  if (activePage === "certificats") return <Certificats onBack={() => setActivePage("dashboard")} />;

  const prenom = user?.nom?.split(" ")[0] || "Utilisatrice";
  const initiales = user?.nom ? user.nom.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "ST";
  const avgProgression = progression.length
    ? Math.round(progression.reduce((acc, p) => acc + (Number(p.pourcentage) || 0), 0) / progression.length)
    : 0;
  const menuItems = [...MENU, ...(user?.role === "admin" ? [{ id: "admin", label: "Administration" }] : [])];
  const progressColors = ["#C45C7A", "#4CAF8A", "#E8A554", "#6D7FCC", "#6D2E46"];

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <button className="dash-logo" type="button" onClick={() => setActivePage("dashboard")}>
          <span>She</span>Tech
        </button>

        <nav className="dash-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePage(item.id)}
              className={activePage === item.id ? "is-active" : ""}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="dash-user">
          <div>{initiales}</div>
          <section>
            <strong>{user?.nom}</strong>
            <span>Niveau {user?.niveau || 1}</span>
          </section>
        </div>
      </aside>

      <main className="dash-main">
        <section className="dash-hero">
          <div>
            <p className="dash-kicker">Espace apprenante</p>
            <h1>Bonjour, {prenom}</h1>
            <p>
              {progression.length
                ? `Vous avez ${progression.length} formation(s) en cours. Continuez votre progression.`
                : "Bienvenue sur votre tableau de bord SheTech. Choisissez une formation pour commencer."}
            </p>
          </div>
          <div className="dash-hero-actions">
            <button type="button" onClick={() => setActivePage("formation")}>Explorer</button>
            <button type="button" onClick={onLogout}>Déconnexion</button>
          </div>
        </section>

        <section className="dash-kpis">
          <KpiCard value={`${avgProgression}%`} label="Progression moyenne" sub={`${progression.length} formation(s) active(s)`} tone="rose" />
          <KpiCard value={progression.length} label="Formations" sub="Parcours en cours" tone="green" delay={70} />
          <KpiCard value={projets.length} label="Projets créés" sub={`${projets.filter((p) => p.statut === "lancé").length} lancé(s)`} tone="gold" delay={140} />
          <KpiCard value="À venir" label="Certificats" sub="Terminez une formation pour générer un certificat" tone="plum" delay={210} />
        </section>

        <section className="dash-grid dash-grid--single">
          <article className="dash-panel dash-panel--wide">
            <div className="dash-panel-head">
              <h2>Formations en cours</h2>
              <button type="button" onClick={() => setActivePage("formation")}>Voir tout</button>
            </div>

            {loading ? (
              <p className="dash-empty">Chargement...</p>
            ) : progression.length === 0 ? (
              <div className="dash-empty">
                <p>Aucune formation en cours</p>
                <button type="button" onClick={() => setActivePage("formation")}>Parcourir le catalogue</button>
              </div>
            ) : (
              progression.map((p, i) => (
                <div className="dash-course" key={`${p.formation_id || i}-${p.formation_titre}`}>
                  <div>
                    <strong>{p.formation_titre || `Formation ${i + 1}`}</strong>
                    <span>{p.formation_domaine || "Formation SheTech"}</span>
                  </div>
                  <b style={{ color: progressColors[i % progressColors.length] }}>{p.pourcentage}%</b>
                  <ProgressBar value={p.pourcentage} color={progressColors[i % progressColors.length]} />
                </div>
              ))
            )}
          </article>

        </section>

        <section className="dash-panel">
          <div className="dash-panel-head">
            <h2>Mes projets</h2>
            <button type="button" onClick={() => setActivePage("projets")}>Voir tout</button>
          </div>

          {loading ? (
            <p className="dash-empty">Chargement...</p>
          ) : projets.length === 0 ? (
            <div className="dash-empty">
              <p>Aucun projet créé</p>
              <button type="button" onClick={() => setActivePage("projets")}>Créer mon premier projet</button>
            </div>
          ) : (
            <div className="dash-projects">
              {projets.slice(0, 4).map((p, i) => (
                <article key={`${p.id || i}-${p.titre}`}>
                  <span>{p.statut === "lancé" ? "Lancé" : "En cours"}</span>
                  <h3>{p.titre}</h3>
                  <p>{p.description}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <button className="dash-cert-banner" type="button" onClick={() => setActivePage("certificats")}>
          <span>
            <strong>Mes certificats</strong>
            <small>Terminez vos formations et téléchargez vos certificats.</small>
          </span>
          <b>→</b>
        </button>
      </main>
    </div>
  );
}
