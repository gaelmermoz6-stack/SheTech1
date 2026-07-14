import { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ACCENT = "#C45C7A";
const ACCENT_LIGHT = "#F5E6EC";
const GRAY = "#6B7280";
const BORDER = "#E5E7EB";

export default function MentorasPage({ onBack, user, onLogout }) {
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjet, setSelectedProjet] = useState(null);
  const [commentaires, setCommentaires] = useState({});
  const [newComment, setNewComment] = useState("");
  const [newNote, setNewNote] = useState(0);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("tous");
  const [evaluationComment, setEvaluationComment] = useState("");
  const [evaluating, setEvaluating] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const handleAuthError = (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      alert("Votre session a expire. Veuillez vous reconnecter.");
      onLogout?.();
      return true;
    }
    return false;
  };

  // ✅ Vrai check du rôle mentor/admin
  const isMentor = user?.role === "mentor" || user?.role === "admin";

  useEffect(() => {
    fetchProjets();
  }, []);

  const fetchProjets = async () => {
    setLoading(true);
    try {
      // Mentor/admin voit tous les projets, apprenante voit seulement les siens
      const url = (user?.role === "apprenante" || !user?.role)
        ? `${API}/projets`
        : `${API}/admin/projets`;
      const res = await axios.get(url, { headers });
      setProjets(res.data.map(normalizeProjet));
    } catch (err) {
      console.error("Erreur chargement projets:", err);
      handleAuthError(err);
    }
    setLoading(false);
  };

  const normalizeProjet = (projet) => ({
    ...projet,
    statut: projet.statut === "lancé" || projet.statut === "lancé"
      ? "lance"
      : projet.statut === "terminé" || projet.statut === "terminé"
        ? "termine"
        : projet.statut
  });

  const fetchCommentaires = async (projetId) => {
    try {
      const res = await axios.get(`${API}/projets/${projetId}/commentaires`, { headers });
      setCommentaires(prev => ({ ...prev, [projetId]: res.data }));
    } catch (err) {
      console.error("Erreur chargement commentaires:", err);
      handleAuthError(err);
    }
  };

  // ✅ Reset du formulaire à chaque ouverture de projet
  const openDetail = async (projet) => {
    setSelectedProjet(projet);
    setEvaluationComment(projet.commentaire_mentor || "");
    setNewComment("");
    setNewNote(0);
    await fetchCommentaires(projet.id);
  };

  const evaluateProjet = async (statutEvaluation) => {
    if (!selectedProjet) return;

    setEvaluating(true);
    try {
      await axios.put(
        `${API}/admin/projets/${selectedProjet.id}/evaluer`,
        {
          statut_evaluation: statutEvaluation,
          commentaire_mentor: evaluationComment.trim() || null
        },
        { headers }
      );

      const updatedProjet = normalizeProjet({
        ...selectedProjet,
        statut_evaluation: statutEvaluation,
        commentaire_mentor: evaluationComment.trim() || null,
        statut: statutEvaluation === "valide" ? "termine" : "en_cours"
      });

      setSelectedProjet(updatedProjet);
      setProjets(prev => prev.map(p => p.id === updatedProjet.id ? updatedProjet : p));
      alert(statutEvaluation === "valide" ? "Projet valide avec succes." : "Projet marque a corriger.");
    } catch (err) {
      console.error("Erreur evaluation projet:", err);
      if (!handleAuthError(err)) {
        const message = err.response?.data?.message || err.message || "Impossible d'evaluer le projet.";
        alert(message);
      }
    } finally {
      setEvaluating(false);
    }
  };

  const addCommentaire = async (projetId) => {
    if (!newComment.trim()) {
      alert("Veuillez écrire un commentaire");
      return;
    }
    setSending(true);
    try {
      await axios.post(
        `${API}/projets/${projetId}/commentaires`,
        { contenu: newComment, note: newNote || null },
        { headers }
      );
      setNewComment("");
      setNewNote(0);
      await fetchCommentaires(projetId);
    } catch (err) {
      console.error("Erreur ajout commentaire:", err);
      if (!handleAuthError(err)) {
        const message = err.response?.data?.message || err.message || "Erreur lors de l'ajout du commentaire";
        alert(message);
      }
    }
    setSending(false);
  };

  const deleteCommentaire = async (commentId) => {
    if (!confirm("Supprimer ce commentaire ?")) return;
    try {
      await axios.delete(`${API}/commentaires/${commentId}`, { headers });
      if (selectedProjet) {
        await fetchCommentaires(selectedProjet.id);
      }
    } catch (err) {
      console.error("Erreur suppression:", err);
      if (handleAuthError(err)) return;
      const message = err.response?.data?.message || err.message || "Impossible de supprimer le commentaire.";
      alert(message);
    }
  };

  const filteredProjets = projets.filter(p => {
    if (filter === "tous") return true;
    if (filter === "en_cours") return p.statut !== "termine";
    if (filter === "termine") return p.statut === "termine";
    return true;
  });

  const getStatusColor = (statut) => {
    if (statut === "termine") return "#00875A";
    if (statut === "lance") return "#4CAF8A";
    return "#E8A554";
  };

  const getStatusLabel = (statut) => {
    if (statut === "termine") return "Terminé";
    if (statut === "lance") return "Lancé";
    return "En cours";
  };

  const getEvaluationLabel = (statut) => {
    if (statut === "valide") return "Validé";
    if (statut === "a_corriger") return "À corriger";
    if (statut === "en_attente") return "En attente";
    return "Non soumis";
  };

  const getEvaluationColor = (statut) => {
    if (statut === "valide") return "#00875A";
    if (statut === "a_corriger") return "#C45C7A";
    if (statut === "en_attente") return "#E8A554";
    return GRAY;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  const StarRating = ({ rating, onRatingChange, readonly = false }) => {
    return (
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => !readonly && onRatingChange?.(star)}
            style={{
              background: "none", border: "none",
              cursor: readonly ? "default" : "pointer",
              fontSize: 20,
              color: star <= rating ? "#FFD700" : "#D1D5DB",
              padding: 0
            }}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="st-soft-page" style={{ minHeight: "100vh", background: "#F4EEF1", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 32, height: 32, border: `3px solid ${BORDER}`,
            borderTop: `3px solid ${ACCENT}`, borderRadius: "50%",
            animation: "spin 1s linear infinite", margin: "0 auto 12px"
          }}></div>
          <p style={{ color: "#9A8090" }}>Chargement des projets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="st-soft-page" style={{ minHeight: "100vh", background: "#F4EEF1", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #2B1B24 0%, #4A1942 100%)",
        padding: "32px 32px 24px",
        color: "#fff"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              {onBack && (
                <button
                  onClick={onBack}
                  style={{
                    background: "rgba(255,255,255,0.15)", border: "none",
                    color: "#fff", padding: "8px 18px", borderRadius: 8,
                    cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 12
                  }}
                >
                  ← Retour
                </button>
              )}
              <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 800 }}>
                Espace Mentorat
              </h1>
              <p style={{ margin: 0, fontSize: 14, opacity: 0.75 }}>
                {isMentor
                  ? "Évaluez les projets des apprenantes et donnez votre avis"
                  : "Partagez vos projets et recevez des retours personnalisés"}
              </p>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{projets.length}</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>Projets</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#6EE7B7" }}>
                  {projets.filter(p => p.statut === "termine").length}
                </div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>Terminés</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px" }}>

        {/* Filtres */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { id: "tous", label: "Tous les projets" },
            { id: "en_cours", label: "En cours" },
            { id: "termine", label: "Terminés" }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                background: filter === f.id ? ACCENT : "#fff",
                color: filter === f.id ? "#fff" : GRAY,
                border: `1px solid ${filter === f.id ? ACCENT : BORDER}`,
                borderRadius: 20, padding: "6px 16px",
                cursor: "pointer", fontSize: 13, fontWeight: 500,
                transition: "all 0.15s"
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ✅ Message si aucun projet (apprenante sans projet) */}
        {filteredProjets.length === 0 ? (
          <div style={{
            textAlign: "center", padding: 48,
            background: "#fff", borderRadius: 12, color: GRAY
          }}>
            {!isMentor ? (
              <>
                <p style={{ fontSize: 16, marginBottom: 8 }}>Vous n'avez pas encore de projet</p>
                <p style={{ fontSize: 13 }}>Créez un projet dans la section "Mes Projets" pour qu'il apparaisse ici.</p>
              </>
            ) : (
              <p>Aucun projet trouvé</p>
            )}
          </div>
        ) : (
          /* Liste des projets */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 20 }}>
            {filteredProjets.map(projet => (
              <div
                key={projet.id}
                onClick={() => openDetail(projet)}
                style={{
                  background: "#fff", borderRadius: 12,
                  border: `1px solid ${BORDER}`, padding: 20,
                  cursor: "pointer", transition: "all 0.3s ease"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#2B1B24" }}>
                    {projet.titre}
                  </h3>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
                    background: `${getStatusColor(projet.statut)}20`,
                    color: getStatusColor(projet.statut)
                  }}>
                    {getStatusLabel(projet.statut)}
                  </span>
                </div>

                <p style={{ fontSize: 13, color: GRAY, lineHeight: 1.5, marginBottom: 12 }}>
                  {projet.description?.substring(0, 100)}...
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#9A8090" }}>
                  {/* ✅ Affiche le nom de l'apprenante uniquement pour les mentors/admins */}
                  {isMentor && <span>👤 {projet.apprenant_nom || "Apprenante"}</span>}
                  <span>📅 {formatDate(projet.created_at)}</span>
                </div>

                <div style={{ marginTop: 12 }}>
                  <span style={{ fontSize: 12, color: ACCENT }}>
                    💬 {(commentaires[projet.id]?.length || 0)} commentaire(s)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de détail du projet */}
      {selectedProjet && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 1000, display: "flex", alignItems: "center",
            justifyContent: "center", padding: 24, overflowY: "auto"
          }}
          onClick={e => e.target === e.currentTarget && setSelectedProjet(null)}
        >
          <div style={{
            background: "#fff", borderRadius: 16,
            width: "100%", maxWidth: 700, maxHeight: "90vh",
            overflowY: "auto", padding: 32, position: "relative"
          }}>

            {/* En-tête */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: "0 0 8px", fontSize: 22, color: "#2B1B24" }}>{selectedProjet.titre}</h2>
                {isMentor && (
                  <p style={{ margin: 0, fontSize: 13, color: GRAY }}>
                    Par {selectedProjet.apprenant_nom || "Apprenante"}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedProjet(null)}
                style={{ background: "transparent", border: "none", fontSize: 24, cursor: "pointer", color: GRAY }}
              >
                ✕
              </button>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Description</h4>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{selectedProjet.description}</p>
            </div>

            {isMentor && (
              <div style={{
                marginBottom: 24,
                background: "#F9F4F6",
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                padding: 18
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Evaluation mentor</h4>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "5px 12px",
                    borderRadius: 20,
                    background: `${getEvaluationColor(selectedProjet.statut_evaluation)}18`,
                    color: getEvaluationColor(selectedProjet.statut_evaluation)
                  }}>
                    {getEvaluationLabel(selectedProjet.statut_evaluation)}
                  </span>
                </div>

                <textarea
                  value={evaluationComment}
                  onChange={e => setEvaluationComment(e.target.value)}
                  placeholder="Commentaire mentor pour expliquer la validation ou les corrections attendues..."
                  rows={3}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: 12,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 8,
                    fontSize: 13,
                    resize: "vertical",
                    fontFamily: "inherit",
                    marginBottom: 12
                  }}
                />

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={() => evaluateProjet("valide")}
                    disabled={evaluating}
                    style={{
                      background: "#00875A",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "10px 16px",
                      cursor: evaluating ? "not-allowed" : "pointer",
                      fontSize: 13,
                      fontWeight: 700,
                      opacity: evaluating ? 0.65 : 1
                    }}
                  >
                    Valider le projet
                  </button>
                  <button
                    onClick={() => evaluateProjet("a_corriger")}
                    disabled={evaluating}
                    style={{
                      background: ACCENT,
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "10px 16px",
                      cursor: evaluating ? "not-allowed" : "pointer",
                      fontSize: 13,
                      fontWeight: 700,
                      opacity: evaluating ? 0.65 : 1
                    }}
                  >
                    A corriger
                  </button>
                </div>
              </div>
            )}

            {/* Technologies */}
            {selectedProjet.technologies && (
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Technologies</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(typeof selectedProjet.technologies === "string"
                    ? JSON.parse(selectedProjet.technologies || "[]")
                    : selectedProjet.technologies
                  ).map((tech, i) => (
                    <span key={i} style={{ background: ACCENT_LIGHT, color: ACCENT, padding: "4px 12px", borderRadius: 20, fontSize: 12 }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Liens */}
            {(selectedProjet.lien_github || selectedProjet.lien_demo) && (
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Liens</h4>
                <div style={{ display: "flex", gap: 16 }}>
                  {selectedProjet.lien_github && (
                    <a href={selectedProjet.lien_github} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT, fontSize: 13 }}>
                      GitHub →
                    </a>
                  )}
                  {selectedProjet.lien_demo && (
                    <a href={selectedProjet.lien_demo} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT, fontSize: 13 }}>
                      Démo →
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Commentaires */}
            <div style={{ marginTop: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
                💬 Commentaires ({commentaires[selectedProjet.id]?.length || 0})
              </h4>

              {/* Liste des commentaires */}
              <div style={{ marginBottom: 24 }}>
                {(commentaires[selectedProjet.id] || []).length === 0 ? (
                  <p style={{ fontSize: 13, color: GRAY, textAlign: "center", padding: 24 }}>
                    Aucun commentaire pour le moment
                  </p>
                ) : (
                  (commentaires[selectedProjet.id] || []).map(comment => (
                    <div key={comment.id} style={{
                      borderBottom: `1px solid ${BORDER}`,
                      padding: "12px 0", marginBottom: 12
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <strong style={{ fontSize: 13 }}>{comment.auteur_nom}</strong>
                          <span style={{ fontSize: 11, color: GRAY, marginLeft: 8 }}>
                            {comment.auteur_role === "mentor" ? "👩‍🏫 Mentor" : "👩‍🎓 Apprenante"}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {comment.note && <StarRating rating={comment.note} readonly />}
                          {(user?.id === comment.user_id || user?.role === "admin") && (
                            <button
                              onClick={() => deleteCommentaire(comment.id)}
                              style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 14 }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: "#374151", marginTop: 6, lineHeight: 1.5 }}>
                        {comment.contenu}
                      </p>
                      <div style={{ fontSize: 10, color: GRAY, marginTop: 4 }}>
                        {new Date(comment.created_at).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* ✅ Formulaire d'ajout de commentaire */}
              <div style={{ background: "#F9F4F6", borderRadius: 12, padding: 20 }}>

                {/* Note par étoiles  uniquement pour mentor/admin */}
                {isMentor && (
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#2B1B24", marginBottom: 8, display: "block" }}>
                      Note (1 à 5 étoiles)
                    </label>
                    <StarRating rating={newNote} onRatingChange={setNewNote} />
                  </div>
                )}

                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder={isMentor
                    ? "Évaluez ce projet, donnez des conseils pour s'améliorer..."
                    : "Partagez votre avis sur ce projet..."}
                  rows={3}
                  style={{
                    width: "100%", padding: "12px",
                    border: `1px solid ${BORDER}`, borderRadius: 8,
                    fontSize: 13, resize: "vertical", fontFamily: "inherit",
                    boxSizing: "border-box"
                  }}
                />

                <button
                  onClick={() => addCommentaire(selectedProjet.id)}
                  disabled={sending || !newComment.trim()}
                  style={{
                    marginTop: 12, background: ACCENT, color: "#fff",
                    border: "none", borderRadius: 8, padding: "10px 20px",
                    cursor: sending || !newComment.trim() ? "not-allowed" : "pointer",
                    fontSize: 13, fontWeight: 600,
                    opacity: sending || !newComment.trim() ? 0.6 : 1
                  }}
                >
                  {sending ? "Envoi..." : "Publier le commentaire"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
