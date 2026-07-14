import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./lib/api";

const ACCENT = "#C45C7A";

export default function Certificats() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState(null);
  const [resultat, setResultat] = useState(null);
  const [formations, setFormations] = useState([]);
  const [certificats, setCertificats] = useState([]);

  useEffect(() => {
    chargerPage();
  }, []);

  const chargerPage = async () => {
    setLoading(true);
    try {
      const [progressionRes, certificatsRes] = await Promise.all([
        api.get("/progression"),
        api.get("/certificat/mes-certificats"),
      ]);

      const progressions = progressionRes.data || [];
      const statuts = await Promise.all(
        progressions.map(async (progression) => {
          try {
            const verifRes = await api.get(`/certificat/verifier/${progression.formation_id}`);
            return {
              ...progression,
              eligible: !!verifRes.data.eligible,
              progression_certificat: verifRes.data.progression,
              formation: verifRes.data.formation,
            };
          } catch {
            return { ...progression, eligible: false };
          }
        })
      );

      setFormations(statuts);
      setCertificats(certificatsRes.data || []);
    } catch (e) {
      setResultat({ success: false, message: "Impossible de charger vos certificats." });
    } finally {
      setLoading(false);
    }
  };

  const obtenirCertificat = async (formation) => {
    setGeneratingId(formation.formation_id);
    setResultat(null);

    try {
      const response = await api.post(
        "/certificat/generer-auto",
        { formationId: formation.formation_id },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      const nomFichier = (formation.formation_titre || "formation_shetech").replace(/[\\/:*?"<>|]/g, "_");
      link.href = url;
      link.setAttribute("download", `certificat_${nomFichier}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setResultat({ success: true, message: "Certificat telecharge avec succes." });
      chargerPage();
    } catch (err) {
      setResultat({
        success: false,
        message: err.response?.data?.message || "Erreur lors de la generation du certificat.",
      });
    } finally {
      setGeneratingId(null);
    }
  };

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const telechargerCertificat = async (certificat) => {
    try {
      const response = await api.get(`/certificat/download/${certificat.id}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      const nomFichier = (certificat.formation_titre || "shetech").replace(/[\\/:*?"<>|]/g, "_");
      link.href = url;
      link.setAttribute("download", `certificat_${nomFichier}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setResultat({
        success: false,
        message: err.response?.data?.message || "Impossible de telecharger ce certificat.",
      });
    }
  };

  const supprimerCertificat = async (certificat) => {
    if (!window.confirm("Supprimer ce certificat ?")) return;

    try {
      await api.delete(`/certificat/${certificat.id}`);
      setCertificats((items) => items.filter((item) => item.id !== certificat.id));
      setResultat({ success: true, message: "Certificat supprime avec succes." });
    } catch (err) {
      setResultat({
        success: false,
        message: err.response?.data?.message || "Impossible de supprimer ce certificat.",
      });
    }
  };

  const formationsTerminees = formations.filter((formation) => formation.eligible);
  const formationsEnCours = formations.filter((formation) => !formation.eligible);

  return (
    <div className="st-soft-page" style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
          ← Tableau de bord
        </button>
        <div>
          <h1 style={styles.title}>Mes Certificats</h1>
          <p style={styles.subtitle}>
            Terminez une formation, puis telechargez votre certificat deja rempli.
          </p>
        </div>
      </div>

      {resultat && (
        <div
          style={{
            ...styles.alertBox,
            background: resultat.success ? "#E8F5F0" : "#FFF3F5",
            borderColor: resultat.success ? "#4CAF8A" : ACCENT,
            color: resultat.success ? "#2E7D5E" : "#8B2040",
          }}
        >
          {resultat.message}
        </div>
      )}

      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Formations terminees</h2>
        <p style={styles.cardSubtitle}>
          Cliquez simplement sur le bouton. Le certificat utilisera automatiquement votre nom, la formation et les dates de validation.
        </p>

        {loading ? (
          <div style={styles.empty}>Chargement...</div>
        ) : formationsTerminees.length === 0 ? (
          <div style={styles.empty}>Aucune formation terminee pour le moment.</div>
        ) : (
          <div style={styles.list}>
            {formationsTerminees.map((formation) => (
              <div key={formation.formation_id} style={styles.formationCard}>
                <div>
                  <strong style={styles.formationTitle}>{formation.formation_titre}</strong>
                  <div style={styles.meta}>{formation.formation_domaine || formation.formation?.domaine || "Formation SheTech"}</div>
                  <div style={styles.meta}>
                    {formation.progression_certificat?.modules_reussis || 0}/{formation.progression_certificat?.modules_total || 0} quiz reussis
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => obtenirCertificat(formation)}
                  disabled={generatingId === formation.formation_id}
                  style={generatingId === formation.formation_id ? styles.btnDisabledSmall : styles.btnPrimarySmall}
                >
                  {generatingId === formation.formation_id ? "Generation..." : "Obtenir mon certificat"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {formationsEnCours.length > 0 && (
        <section style={{ ...styles.card, marginTop: 24 }}>
          <h2 style={styles.cardTitle}>Formations en cours</h2>
          <div style={styles.list}>
            {formationsEnCours.map((formation) => (
              <div key={formation.formation_id} style={styles.formationCard}>
                <div>
                  <strong style={styles.formationTitle}>{formation.formation_titre}</strong>
                  <div style={styles.meta}>
                    Progression certificat : {formation.progression_certificat?.modules_reussis || 0}/{formation.progression_certificat?.modules_total || 0} quiz reussis
                  </div>
                </div>
                <span style={styles.pendingBadge}>A terminer</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {certificats.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <h2 style={styles.sectionTitle}>Mes certificats obtenus</h2>
          <div style={styles.list}>
            {certificats.map((c) => (
              <div key={c.id} style={styles.histCard}>
                <div style={{ flex: 1 }}>
                  <div style={styles.formationTitle}>{c.formation_titre}</div>
                  <div style={styles.meta}>{c.domaine}</div>
                  <div style={styles.meta}>Emis le {formatDate(c.date_emission)}</div>
                </div>
                <button type="button" onClick={() => telechargerCertificat(c)} style={styles.histDownload}>
                  Telecharger
                </button>
                <button type="button" onClick={() => supprimerCertificat(c)} style={styles.histDelete}>
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#FDF6F9",
    padding: "32px 24px",
    fontFamily: "'Segoe UI', sans-serif",
    maxWidth: 960,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 28,
    background: "linear-gradient(135deg, #2B1B24 0%, #6D2E46 100%)",
    borderRadius: 16,
    padding: 24,
    color: "#fff",
    boxShadow: "0 18px 42px rgba(43,27,36,0.16)",
  },
  backBtn: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.22)",
    borderRadius: 8,
    padding: "8px 14px",
    cursor: "pointer",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    marginTop: 4,
  },
  title: { margin: 0, fontSize: 30, fontWeight: 900, color: "#fff" },
  subtitle: { margin: "6px 0 0", color: "rgba(255,255,255,0.76)", fontSize: 14 },
  card: {
    background: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 18px 42px rgba(196,92,122,0.11)",
    border: "1px solid #F3E0E8",
  },
  cardTitle: { margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: "#2B1B24" },
  cardSubtitle: { margin: "0 0 20px", fontSize: 13, color: "#9A8090", lineHeight: 1.6 },
  alertBox: { border: "1px solid", borderRadius: 10, padding: "14px 16px", marginBottom: 16, fontWeight: 600 },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  empty: { padding: 24, textAlign: "center", color: "#9A8090", background: "#fff", borderRadius: 10, border: "1px solid #F3E0E8" },
  formationCard: {
    background: "#fff",
    borderRadius: 12,
    padding: "16px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    border: "1px solid #F3E0E8",
  },
  formationTitle: { fontWeight: 700, color: "#2B1B24", fontSize: 14 },
  meta: { fontSize: 12, color: "#9A8090", marginTop: 3 },
  btnPrimarySmall: {
    background: ACCENT,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    flexShrink: 0,
  },
  btnDisabledSmall: {
    background: "#E0D0D5",
    color: "#aaa",
    border: "none",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "not-allowed",
    flexShrink: 0,
  },
  pendingBadge: {
    background: "#FFF3F5",
    color: "#8B2040",
    borderRadius: 20,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#2B1B24",
    marginBottom: 16,
    borderLeft: `4px solid ${ACCENT}`,
    paddingLeft: 12,
  },
  histCard: {
    background: "#fff",
    borderRadius: 12,
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "1px solid #F3E0E8",
  },
  histDownload: {
    background: "#E8F5F0",
    color: "#2E7D5E",
    border: "none",
    borderRadius: 20,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  histDelete: {
    background: "#FFF3F5",
    color: "#8B2040",
    border: "1px solid #F1C6D2",
    borderRadius: 20,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
};
