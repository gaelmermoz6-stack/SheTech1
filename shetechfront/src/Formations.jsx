import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormationDetail from "./FormationDetail";
import homeHero from "./assets/home-hero.png";
import api from "./lib/api";

const ACCENT = "#C45C7A";
const TEXT_MAIN = "#2B1B24";
const TEXT_MID = "#7A6570";
const TEXT_MUTED = "#9A8090";
const BORDER_CLR = "#EDE3E7";

const DOMAINES = [
  {
    id: "developpement",
    titre: "Développement Web",
    description: "HTML, CSS, JavaScript, React, Python — construis des sites et applications web de A à Z.",
    formations: 8,
  },
  {
    id: "ia",
    titre: "Intelligence Artificielle",
    description: "Machine Learning, Deep Learning, outils IA — maîtrise les technologies du futur.",
    formations: 5,
  },
  {
    id: "marketing",
    titre: "Marketing Digital",
    description: "Réseaux sociaux, SEO, publicité en ligne — développe ta présence digitale.",
    formations: 10,
  },
  {
    id: "ecommerce",
    titre: "E-commerce",
    description: "Crée ta boutique en ligne, gère tes ventes et développe ton business.",
    formations: 6,
  },
  {
    id: "leadership",
    titre: "Leadership & Business",
    description: "Management, gestion de projet, communication — deviens une leader accomplie.",
    formations: 7,
  },
  {
    id: "freelance",
    titre: "Freelance & Entrepreneuriat",
    description: "Lance ton activité, trouve tes clients, fixe tes tarifs — travaille à ton compte.",
    formations: 5,
  },
  {
    id: "design",
    titre: "Design UI/UX",
    description: "Figma, Canva, design thinking — crée des interfaces belles et intuitives.",
    formations: 6,
  },
  {
    id: "cybersecurite",
    titre: "Cybersécurité",
    description: "Protège les données, comprends les menaces — un secteur qui recrute massivement.",
    formations: 4,
  },
];

/* ─────────────────────────────────────────────
   CARTE DOMAINE — design sobre, uniforme
───────────────────────────────────────────── */
function DomaineCard({ domaine, progression, onClick }) {
  const [hovered, setHovered] = useState(false);
  const prog = progression[domaine.id] || 0;

  return (
    <div
      className="st-formation-row"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 8,
        overflow: "hidden",
        cursor: "pointer",
        border: hovered ? `1px solid ${ACCENT}` : "1px solid #e5e7eb",
        boxShadow: hovered ? "0 4px 16px rgba(0,0,0,0.10)" : "0 1px 3px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.18s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Bande fine — couleur unique SheTech */}
      <div style={{ height: 4, background: ACCENT }} />

      <div style={{ padding: "20px 22px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT_MAIN, marginBottom: 8, lineHeight: 1.35 }}>
          {domaine.titre}
        </h3>

        <p
          style={{
            fontSize: 13,
            color: TEXT_MID,
            lineHeight: 1.65,
            flex: 1,
            marginBottom: 18,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {domaine.description}
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: TEXT_MUTED }}>
            {domaine.formations} formations
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: ACCENT }}>
            Découvrir →
          </span>
        </div>

        {prog > 0 && (
          <>
            <div style={{ marginTop: 14, background: "#f3f4f6", borderRadius: 4, height: 4 }}>
              <div
                style={{
                  width: `${prog}%`,
                  height: "100%",
                  background: ACCENT,
                  borderRadius: 4,
                  transition: "width 0.8s ease",
                }}
              />
            </div>
            <span style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 5 }}>{prog}% complété</span>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CARTE FORMATION — liste horizontale, sobre
───────────────────────────────────────────── */
function FormationCard({ formation, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        borderLeft: `4px solid ${ACCENT}`,
        padding: "20px 24px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 24,
        boxShadow: hovered ? "0 4px 16px rgba(0,0,0,0.08)" : "none",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        transition: "all 0.18s ease",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: TEXT_MAIN,
            marginBottom: 5,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {formation.titre}
        </h3>

        <p
          style={{
            fontSize: 13,
            color: TEXT_MID,
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {formation.description}
        </p>
      </div>

      <div style={{ flexShrink: 0, textAlign: "right" }}>
        {(formation.modules || formation.duree) && (
          <div style={{ display: "flex", gap: 14, marginBottom: 10, justifyContent: "flex-end" }}>
            {formation.modules && (
              <span style={{ fontSize: 12, color: TEXT_MUTED }}>{formation.modules} modules</span>
            )}
            {formation.duree && (
              <span style={{ fontSize: 12, color: TEXT_MUTED }}>{formation.duree}</span>
            )}
          </div>
        )}
        <button
          style={{
            padding: "8px 20px",
            borderRadius: 6,
            border: `1.5px solid ${ACCENT}`,
            background: hovered ? ACCENT : "transparent",
            color: hovered ? "#fff" : ACCENT,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.18s",
            fontFamily: "inherit",
          }}
        >
          Commencer
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   VUE FORMATIONS D'UN DOMAINE
───────────────────────────────────────────── */
function VueFormations({ domaine, onBack, onOpenFormation }) {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get(`/formations?domaine=${domaine.id}`)
      .then((res) => setFormations(res.data))
      .catch(() => {
        setFormations([
          {
            id: 1,
            titre: `Introduction au ${domaine.titre}`,
            description: "Les bases essentielles pour démarrer dans ce domaine avec confiance.",
            modules: 4,
            duree: "6h",
          },
          {
            id: 2,
            titre: `${domaine.titre} — Atelier pratique`,
            description: "Approfondissez vos connaissances avec des applications concrètes.",
            modules: 6,
            duree: "12h",
          },
          {
            id: 3,
            titre: `Projets appliqués — ${domaine.titre}`,
            description: "Réalisez des projets concrets et construisez votre portfolio professionnel.",
            modules: 8,
            duree: "20h",
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, [domaine.id]);

  const formationsFiltrees = formations.filter(
    (f) =>
      f.titre.toLowerCase().includes(recherche.toLowerCase()) ||
      f.description?.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="st-soft-page" style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "13px 40px" }}>
        <span onClick={onBack} style={{ fontSize: 13, color: TEXT_MID, cursor: "pointer" }}>
          Formations
        </span>
        <span style={{ fontSize: 13, color: "#d1d5db", margin: "0 8px" }}>/</span>
        <span style={{ fontSize: 13, color: TEXT_MAIN, fontWeight: 600 }}>{domaine.titre}</span>
      </div>

      {/* Hero */}
      <div style={{ background: `linear-gradient(115deg, rgba(26,15,20,0.94), rgba(74,25,66,0.76)), url(${homeHero}) center/cover`, borderBottom: `3px solid ${ACCENT}`, padding: "40px 40px 36px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 8, letterSpacing: "-0.3px" }}>
          {domaine.titre}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.6, maxWidth: 540, marginBottom: 24 }}>
          {domaine.description}
        </p>
        <input
          className="st-page-search"
          type="text"
          placeholder="Rechercher une formation..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          style={{
            width: 360,
            padding: "10px 14px",
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.07)",
            color: "#fff",
            fontSize: 13,
            outline: "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Liste */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
        <p style={{ fontSize: 13, color: TEXT_MID, marginBottom: 20 }}>
          {recherche
            ? `${formationsFiltrees.length} résultat${formationsFiltrees.length > 1 ? "s" : ""} pour "${recherche}"`
            : `${formationsFiltrees.length} formation${formationsFiltrees.length > 1 ? "s" : ""} disponible${formationsFiltrees.length > 1 ? "s" : ""}`}
        </p>

        {loading ? (
          <div style={{ background: "#fff", borderRadius: 8, padding: "48px", textAlign: "center", color: TEXT_MUTED, fontSize: 14 }}>
            Chargement des formations...
          </div>
        ) : formationsFiltrees.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 8, padding: "48px", textAlign: "center" }}>
            <p style={{ color: TEXT_MID, fontSize: 14, marginBottom: 8 }}>Aucune formation trouvée.</p>
            <span
              onClick={() => setRecherche("")}
              style={{ fontSize: 13, color: ACCENT, cursor: "pointer", fontWeight: 600 }}
            >
              Réinitialiser la recherche
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {formationsFiltrees.map((f, index) => (
              <div key={f.id} className="st-animate-card" style={{ animationDelay: `${index * 45}ms` }}>
              <FormationCard
                formation={f}
                onClick={() => onOpenFormation({ ...f, domaine_id: domaine.id })}
              />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   VUE PRINCIPALE — grille des domaines
───────────────────────────────────────────── */
export default function Formations() {
  const navigate = useNavigate();
  const [vue, setVue] = useState("domaines");
  const [domaineSelectionne, setDomaineSelectionne] = useState(null);
  const [formationSelectionnee, setFormationSelectionnee] = useState(null);
  const [progression, setProgression] = useState({});
  const [recherche, setRecherche] = useState("");

  useEffect(() => {
    api
      .get("/progression")
      .then((res) => {
        const progParDomaine = {};
        res.data.forEach((p) => {
          const domaineId = p.domaine_id || p.formation_domaine;
          if (domaineId) {
            if (!progParDomaine[domaineId]) progParDomaine[domaineId] = [];
            progParDomaine[domaineId].push(Number(p.pourcentage) || 0);
          }
        });
        const moyenne = {};
        Object.keys(progParDomaine).forEach((d) => {
          const vals = progParDomaine[d];
          moyenne[d] = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
        });
        setProgression(moyenne);
      })
      .catch(() => {});
  }, []);

  if (vue === "detail" && formationSelectionnee) {
    return (
      <FormationDetail
        formation={formationSelectionnee}
        domaine={domaineSelectionne}
        onBack={() => setVue("formations")}
      />
    );
  }

  if (vue === "formations" && domaineSelectionne) {
    return (
      <VueFormations
        domaine={domaineSelectionne}
        onBack={() => setVue("domaines")}
        onOpenFormation={(formation) => {
          setFormationSelectionnee(formation);
          setVue("detail");
        }}
      />
    );
  }

  const domainesFiltres = DOMAINES.filter((d) =>
    d.titre.toLowerCase().includes(recherche.toLowerCase()) ||
    d.description.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="st-soft-page" style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(115deg, rgba(26,15,20,0.94), rgba(74,25,66,0.76)), url(${homeHero}) center/cover`, padding: "0 40px" }}>
        <div style={{ padding: "13px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <span
            onClick={() => navigate("/dashboard")}
            style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}
          >
            ← Tableau de bord
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "32px 0 36px", flexWrap: "wrap", gap: 20 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 6, letterSpacing: "-0.5px" }}>
              Nos formations
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
              {DOMAINES.length} domaines · Plus de 50 formations disponibles
            </p>
          </div>

          <input
            className="st-page-search"
            type="text"
            placeholder="Rechercher un domaine..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            style={{
              padding: "10px 16px",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.07)",
              color: "#fff",
              fontSize: 13,
              outline: "none",
              width: 260,
              fontFamily: "inherit",
            }}
          />
        </div>
      </div>

      {/* Contenu */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px" }}>

        {/* Tous les domaines */}
        <section>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: TEXT_MAIN, marginBottom: 20 }}>
            {recherche ? `Résultats (${domainesFiltres.length})` : "Tous les domaines"}
          </h2>

          {domainesFiltres.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 8, padding: "48px", textAlign: "center" }}>
              <p style={{ color: TEXT_MID, fontSize: 14, marginBottom: 8 }}>Aucun domaine trouvé.</p>
              <span
                onClick={() => setRecherche("")}
                style={{ fontSize: 13, color: ACCENT, cursor: "pointer", fontWeight: 600 }}
              >
                Réinitialiser la recherche
              </span>
            </div>
          ) : (
            <div className="st-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {domainesFiltres.map((d, index) => (
                <div key={d.id} className="st-animate-card" style={{ animationDelay: `${index * 45}ms` }}>
                <DomaineCard
                  domaine={d}
                  progression={progression}
                  onClick={() => { setDomaineSelectionne(d); setVue("formations"); }}
                />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
