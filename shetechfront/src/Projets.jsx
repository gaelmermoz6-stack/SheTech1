import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import api from "./lib/api";

const PROJECT_DOMAINS = [
  "Developpement Web",
  "Intelligence Artificielle",
  "Marketing Digital",
  "Design UI/UX",
  "E-commerce",
  "Leadership",
  "Cybersecurite",
  "Freelance",
  "Autre"
];

const DOMAIN_DETAILS = {
  "Developpement Web": {
    toolsLabel: "Technologies utilisees",
    toolsPlaceholder: "React, Node.js, MySQL...",
    deliverables: "Code source, lien GitHub, lien demo, documentation PDF"
  },
  "Intelligence Artificielle": {
    toolsLabel: "Outils, modeles ou donnees",
    toolsPlaceholder: "Python, TensorFlow, dataset, notebook...",
    deliverables: "Notebook, rapport PDF, jeu de donnees, presentation"
  },
  "Marketing Digital": {
    toolsLabel: "Canaux et outils utilises",
    toolsPlaceholder: "Instagram, Canva, Meta Ads, email...",
    deliverables: "Strategie PDF, calendrier editorial, rapport de campagne"
  },
  "Design UI/UX": {
    toolsLabel: "Outils et methodes",
    toolsPlaceholder: "Figma, wireframes, prototype, tests utilisateur...",
    deliverables: "Maquette, prototype, moodboard, rapport UX"
  },
  "E-commerce": {
    toolsLabel: "Plateformes et ressources",
    toolsPlaceholder: "Shopify, WooCommerce, catalogue, paiement...",
    deliverables: "Catalogue PDF, fiche boutique, plan commercial"
  },
  "Leadership": {
    toolsLabel: "Competences travaillees",
    toolsPlaceholder: "Communication, planification, gestion d'equipe...",
    deliverables: "Plan d'action, presentation, rapport de decision"
  },
  "Cybersecurite": {
    toolsLabel: "Outils et notions",
    toolsPlaceholder: "Audit, OWASP, analyse de risques, bonnes pratiques...",
    deliverables: "Rapport d'audit, checklist, plan de securisation"
  },
  "Freelance": {
    toolsLabel: "Outils et competences",
    toolsPlaceholder: "Portfolio, prospection, devis, gestion client...",
    deliverables: "Portfolio, proposition commerciale, modele de devis"
  },
  "Autre": {
    toolsLabel: "Outils / competences",
    toolsPlaceholder: "Outils, methodes, competences...",
    deliverables: "Rapport PDF, presentation, fichier de travail"
  }
};

const defaultFormData = {
  titre: "",
  description: "",
  statut: "en_cours",
  domaine: "",
  lien_github: "",
  lien_demo: "",
  technologies: ""
};

export default function Projets() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProjet, setEditingProjet] = useState(null);
  const [selectedProjet, setSelectedProjet] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [createLivrableTitre, setCreateLivrableTitre] = useState("");
  const [createLivrableFichier, setCreateLivrableFichier] = useState(null);

  // ✅ Livrables persistés : { [projetId]: [{id, titre, fichier_url}] }
  const [livrables, setLivrables] = useState({});
  const [livrableLoading, setLivrableLoading] = useState(false);
  
  // ✅ États pour le modal d'upload
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentProjetId, setCurrentProjetId] = useState(null);
  const [newLivrableTitre, setNewLivrableTitre] = useState("");
  const [newLivrableFichier, setNewLivrableFichier] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleAuthError = (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      alert("Votre session a expire. Veuillez vous reconnecter.");
      logout();
      navigate("/login");
      return true;
    }
    return false;
  };

  const getProjectProgress = (statut) => {
    switch (statut) {
      case "termine": return 100;
      case "lance": return 75;
      default: return 45;
    }
  };

  const normalizeProjet = (projet) => ({
    ...projet,
    statut: projet.statut === "lancé" ? "lance" : projet.statut === "terminé" ? "termine" : projet.statut,
    technologies: typeof projet.technologies === "string"
      ? projet.technologies ? JSON.parse(projet.technologies) : []
      : Array.isArray(projet.technologies) ? projet.technologies : []
  });

  const projectStatusLabel = (statut) => {
    if (statut === "termine") return "Termine";
    if (statut === "lance") return "Lance";
    return "En cours";
  };

  const projectStatusColor = (statut) => {
    if (statut === "termine") return "#2E7D32";
    if (statut === "lance") return "#4CAF8A";
    return "#E8A554";
  };

  const getDomainDetails = (domaine) => DOMAIN_DETAILS[domaine] || DOMAIN_DETAILS.Autre;
  const currentDomainDetails = getDomainDetails(formData.domaine);
  const currentUploadProjet = projets.find((projet) => projet.id === currentProjetId);
  const currentUploadDetails = getDomainDetails(currentUploadProjet?.domaine);

  useEffect(() => { fetchProjets(); }, []);

  const fetchProjets = async () => {
    try {
      const response = await api.get("/projets");
      setProjets(response.data.map(normalizeProjet));
    } catch (err) {
      console.error("Erreur chargement projets:", err);
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Charger les livrables depuis le backend
  const fetchLivrables = async (projetId) => {
    try {
      const res = await api.get(`/projets/${projetId}/livrables`);
      setLivrables(prev => ({ ...prev, [projetId]: res.data }));
    } catch (err) {
      console.error("Erreur chargement livrables:", err);
    }
  };

  // ✅ Ouvrir le détail et charger les livrables en même temps
  const openDetail = (projet) => {
    setSelectedProjet(projet);
    fetchLivrables(projet.id);
  };

  // ✅ Ouvrir le modal d'upload
  const openUploadModal = (projetId) => {
    setCurrentProjetId(projetId);
    setNewLivrableTitre("");
    setNewLivrableFichier(null);
    setShowUploadModal(true);
  };

  // ✅ Gérer la sélection du fichier
  const handleFileChange = (e) => {
    setNewLivrableFichier(e.target.files[0]);
  };

  const handleCreateLivrableFileChange = (e) => {
    setCreateLivrableFichier(e.target.files[0]);
  };

  // ✅ Uploader un livrable AVEC fichier
  const handleUpload = async () => {
    if (!newLivrableTitre.trim()) {
      alert("Veuillez entrer un titre");
      return;
    }
    if (!newLivrableFichier) {
      alert("Veuillez sélectionner un fichier");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("titre", newLivrableTitre.trim());
    formData.append("fichier", newLivrableFichier);

    try {
      const res = await api.post(`/projets/${currentProjetId}/livrables`, formData);
      
      setLivrables(prev => ({
        ...prev,
        [currentProjetId]: [...(prev[currentProjetId] || []), res.data]
      }));
      
      setShowUploadModal(false);
      setNewLivrableTitre("");
      setNewLivrableFichier(null);
    } catch (err) {
      console.error("Erreur upload livrable:", err);
      alert("Impossible d'ajouter le livrable. Vérifiez que le serveur supporte les uploads.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Supprimer un livrable via API
  const removeLivrable = async (projetId, livrableId) => {
    if (!window.confirm("Supprimer ce livrable ?")) return;
    
    try {
      await api.delete(`/livrables/${livrableId}`);
      setLivrables(prev => ({
        ...prev,
        [projetId]: prev[projetId].filter(l => l.id !== livrableId)
      }));
    } catch (err) {
      console.error("Erreur suppression livrable:", err);
      alert("Impossible de supprimer le livrable.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    try {
      if (!editingProjet && !createLivrableFichier) {
        alert("Veuillez ajouter le livrable du projet.");
        return;
      }

      setSaving(true);
      const data = {
        ...formData,
        technologies: formData.technologies.split(",").map(t => t.trim()).filter(t => t)
      };
      if (editingProjet) {
        await api.put(`/projets/${editingProjet.id}`, data);
      } else {
        const projetRes = await api.post("/projets", data);
        const projetId = projetRes.data.id;
        const livrableFormData = new FormData();
        livrableFormData.append("titre", createLivrableTitre.trim() || "Livrable principal");
        livrableFormData.append("fichier", createLivrableFichier);
        await api.post(`/projets/${projetId}/livrables`, livrableFormData);
      }
      resetForm();
      fetchProjets();
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
      if (handleAuthError(err)) return;
      const message = err.response?.data?.message || err.message || "Impossible de sauvegarder le projet.";
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (projet) => {
    setEditingProjet(projet);
    setCreateLivrableTitre("");
    setCreateLivrableFichier(null);
    setFormData({
      titre: projet.titre,
      description: projet.description,
      statut: projet.statut,
      domaine: projet.domaine || "",
      lien_github: projet.lien_github || "",
      lien_demo: projet.lien_demo || "",
      technologies: projet.technologies ? projet.technologies.join(", ") : ""
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Etes-vous sur de vouloir supprimer ce projet ?")) {
      try {
        await api.delete(`/projets/${id}`);
        fetchProjets();
      } catch (err) {
        console.error("Erreur suppression:", err);
      }
    }
  };

  const resetForm = () => {
    setShowCreateForm(false);
    setEditingProjet(null);
    setFormData(defaultFormData);
    setCreateLivrableTitre("");
    setCreateLivrableFichier(null);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#F4EEF1", fontFamily: "'Georgia', serif" }}>
        <p style={{ color: "#9A8090", fontSize: 16 }}>Chargement des projets...</p>
      </div>
    );
  }

  return (
    <div className="st-soft-page" style={{ minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#F4EEF1" }}>

      {/* Header */}
      <div style={{ background: "#2B1B24", color: "#fff", padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>
            ← Tableau de bord
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Mes Projets</h1>
        </div>
        <button onClick={() => setShowCreateForm(true)} style={{ background: "#C45C7A", border: "none", color: "#fff", padding: "12px 24px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
          + Nouveau Projet
        </button>
      </div>

      <div style={{ padding: "32px" }}>

        {/* Formulaire création / édition */}
        {showCreateForm && (
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 2px 12px rgba(43,27,36,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#2B1B24", margin: 0 }}>
                {editingProjet ? "Modifier le projet" : "Creer un nouveau projet"}
              </h2>
              <button onClick={resetForm} style={{ background: "transparent", border: "none", color: "#9A8090", cursor: "pointer", fontSize: 20 }}>x</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#2B1B24", marginBottom: 4 }}>Titre du projet *</label>
                <input type="text" value={formData.titre} onChange={e => setFormData({ ...formData, titre: e.target.value })} required
                  style={{ width: "100%", padding: 12, border: "1px solid #EDE3E7", borderRadius: 6, fontSize: 14 }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#2B1B24", marginBottom: 4 }}>Description *</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required rows={4}
                  style={{ width: "100%", padding: 12, border: "1px solid #EDE3E7", borderRadius: 6, fontSize: 14, resize: "vertical" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#2B1B24", marginBottom: 4 }}>Statut</label>
                  <select value={formData.statut} onChange={e => setFormData({ ...formData, statut: e.target.value })}
                    style={{ width: "100%", padding: 12, border: "1px solid #EDE3E7", borderRadius: 6, fontSize: 14 }}>
                    <option value="en_cours">En cours</option>
                    <option value="lance">Lance</option>
                    <option value="termine">Termine</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#2B1B24", marginBottom: 4 }}>Domaine *</label>
                  <select value={formData.domaine} onChange={e => setFormData({ ...formData, domaine: e.target.value })} required
                    style={{ width: "100%", padding: 12, border: "1px solid #EDE3E7", borderRadius: 6, fontSize: 14 }}>
                    <option value="">Choisir un domaine</option>
                    {PROJECT_DOMAINS.map((domaine) => (
                      <option key={domaine} value={domaine}>{domaine}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#2B1B24", marginBottom: 4 }}>
                  {currentDomainDetails.toolsLabel} (separes par des virgules)
                </label>
                <input type="text" value={formData.technologies} onChange={e => setFormData({ ...formData, technologies: e.target.value })}
                  placeholder={currentDomainDetails.toolsPlaceholder}
                  style={{ width: "100%", padding: 12, border: "1px solid #EDE3E7", borderRadius: 6, fontSize: 14 }} />
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#9A8090" }}>
                  Livrables possibles : {currentDomainDetails.deliverables}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#2B1B24", marginBottom: 4 }}>Lien GitHub</label>
                  <input type="url" value={formData.lien_github} onChange={e => setFormData({ ...formData, lien_github: e.target.value })}
                    placeholder="https://github.com/..."
                    style={{ width: "100%", padding: 12, border: "1px solid #EDE3E7", borderRadius: 6, fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#2B1B24", marginBottom: 4 }}>Lien demo / ressource</label>
                  <input type="url" value={formData.lien_demo} onChange={e => setFormData({ ...formData, lien_demo: e.target.value })}
                    placeholder="https://..."
                    style={{ width: "100%", padding: 12, border: "1px solid #EDE3E7", borderRadius: 6, fontSize: 14 }} />
                </div>
              </div>

              {!editingProjet && (
                <div style={{ background: "#F9F4F6", border: "1px solid #EDE3E7", borderRadius: 10, padding: 16 }}>
                  <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#2B1B24" }}>
                    Livrable du projet
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#2B1B24", marginBottom: 4 }}>Titre du livrable</label>
                      <input
                        type="text"
                        value={createLivrableTitre}
                        onChange={e => setCreateLivrableTitre(e.target.value)}
                        placeholder={`Ex: ${currentDomainDetails.deliverables.split(",")[0]}`}
                        style={{ width: "100%", padding: 12, border: "1px solid #EDE3E7", borderRadius: 6, fontSize: 14 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#2B1B24", marginBottom: 4 }}>Fichier livrable *</label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                        onChange={handleCreateLivrableFileChange}
                        required
                        style={{ width: "100%", padding: 10, border: "1px solid #EDE3E7", borderRadius: 6, fontSize: 13, background: "#fff" }}
                      />
                    </div>
                  </div>
                  <p style={{ margin: "8px 0 0", fontSize: 12, color: "#9A8090" }}>
                    Le livrable sera publie automatiquement avec le projet dans la communaute. Suggestions : {currentDomainDetails.deliverables}
                  </p>
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button type="submit" disabled={saving} style={{ background: saving ? "#9A8090" : "#C45C7A", border: "none", color: "#fff", padding: "12px 24px", borderRadius: 6, cursor: saving ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600 }}>
                  {saving ? "Enregistrement..." : editingProjet ? "Modifier" : "Creer et publier"}
                </button>
                <button type="button" onClick={resetForm} style={{ background: "transparent", border: "1px solid #EDE3E7", color: "#9A8090", padding: "12px 24px", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Detail projet */}
        {selectedProjet && (
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 2px 12px rgba(43,27,36,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: projectStatusColor(selectedProjet.statut) }} />
                  <div style={{ fontSize: 13, color: projectStatusColor(selectedProjet.statut), fontWeight: 700 }}>
                    {projectStatusLabel(selectedProjet.statut)}
                  </div>
                  {selectedProjet.domaine && (
                    <div style={{ fontSize: 12, color: "#C45C7A", fontWeight: 700, background: "#F4EEF1", padding: "4px 10px", borderRadius: 999 }}>
                      {selectedProjet.domaine}
                    </div>
                  )}
                </div>
                <h2 style={{ fontSize: 20, margin: 0, color: "#2B1B24" }}>{selectedProjet.titre}</h2>
                <p style={{ color: "#9A8090", fontSize: 14, lineHeight: 1.75, marginTop: 8 }}>{selectedProjet.description}</p>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button onClick={() => { handleEdit(selectedProjet); setSelectedProjet(null); }}
                  style={{ background: "#C45C7A", border: "none", color: "#fff", padding: "12px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  Mettre a jour
                </button>
                <button onClick={() => setSelectedProjet(null)}
                  style={{ background: "transparent", border: "1px solid #EDE3E7", color: "#9A8090", padding: "12px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
                  Fermer
                </button>
              </div>
            </div>

            {/* Barre de progression */}
            <div style={{ marginTop: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 10, background: "#EDF2F7", borderRadius: 999 }}>
                  <div style={{ width: `${getProjectProgress(selectedProjet.statut)}%`, height: 10, background: "#C45C7A", borderRadius: 999, transition: "width 0.3s" }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#2B1B24" }}>{getProjectProgress(selectedProjet.statut)}%</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 18 }}>

                {/* ✅ Livrables avec upload de fichiers */}
                <div style={{ background: "#F9F4F6", borderRadius: 12, padding: 18 }}>
                  <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#2B1B24" }}>Livrables</h3>

                  {(livrables[selectedProjet.id] || []).length === 0 && (
                    <p style={{ fontSize: 13, color: "#9A8090", margin: "0 0 10px" }}>Aucun livrable ajoute.</p>
                  )}

                  <ul style={{ paddingLeft: 0, margin: "0 0 12px", listStyle: "none" }}>
                    {(livrables[selectedProjet.id] || []).map((l) => (
                      <li key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #EDE3E7", fontSize: 14, color: "#2B1B24" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span>{l.titre}</span>
                          {l.fichier_url && (
                            <a
                              href={`${API}${l.fichier_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#C45C7A", fontSize: 12, textDecoration: "none", background: "#F4EEF1", padding: "2px 8px", borderRadius: 4 }}
                            >
                              📄 Télécharger
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => removeLivrable(selectedProjet.id, l.id)}
                          style={{ background: "transparent", border: "none", color: "#C45C7A", cursor: "pointer", fontSize: 16, lineHeight: 1 }}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* ✅ Bouton qui ouvre le modal d'upload */}
                  <button
                    onClick={() => openUploadModal(selectedProjet.id)}
                    style={{ background: "#C45C7A", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600, width: "100%" }}
                  >
                    + Ajouter un livrable (fichier)
                  </button>
                </div>

                {/* Competences */}
                <div style={{ background: "#F9F4F6", borderRadius: 12, padding: 18 }}>
                  <h3 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: "#2B1B24" }}>
                    {getDomainDetails(selectedProjet.domaine).toolsLabel}
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {selectedProjet.technologies?.map((tech, i) => (
                      <span key={i} style={{ fontSize: 12, padding: "6px 10px", background: "#fff", border: "1px solid #EDE3E7", borderRadius: 8, color: "#2B1B24" }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Liste des projets */}
        {projets.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 12, padding: 48, textAlign: "center", boxShadow: "0 2px 12px rgba(43,27,36,0.1)" }}>
            <p style={{ color: "#9A8090", fontSize: 16, marginBottom: 16 }}>Aucun projet cree pour le moment</p>
            <button onClick={() => setShowCreateForm(true)} style={{ background: "#C45C7A", border: "none", color: "#fff", padding: "12px 24px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
              Creer mon premier projet
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 20 }}>
            {projets.map(projet => (
              <div key={projet.id} style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(43,27,36,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2B1B24", margin: 0 }}>{projet.titre}</h3>
                      {projet.domaine && (
                        <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: "#F4EEF1", color: "#C45C7A" }}>
                          {projet.domaine}
                        </span>
                      )}
                      <span style={{
                        fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
                        background: projet.statut === "lance" ? "#EDF7F2" : projet.statut === "termine" ? "#E8F5E8" : "#F4EEF1",
                        color: projet.statut === "lance" ? "#4CAF8A" : projet.statut === "termine" ? "#2E7D32" : "#E8A554"
                      }}>
                        {projectStatusLabel(projet.statut)}
                      </span>
                    </div>
                    <p style={{ color: "#9A8090", fontSize: 14, lineHeight: 1.5, margin: 0 }}>{projet.description}</p>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: 16 }}>
                    <button onClick={() => openDetail(projet)}
                      style={{ background: "#C45C7A", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                      Voir
                    </button>
                    <button onClick={() => handleEdit(projet)}
                      style={{ background: "#2B1B24", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(projet.id)}
                      style={{ background: "transparent", border: "1px solid #C45C7A", color: "#C45C7A", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                      Supprimer
                    </button>
                  </div>
                </div>

                {projet.technologies?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#2B1B24", marginBottom: 8 }}>{getDomainDetails(projet.domaine).toolsLabel} :</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {projet.technologies.map((tech, i) => (
                        <span key={i} style={{ fontSize: 11, padding: "4px 8px", background: "#F4EEF1", color: "#C45C7A", borderRadius: 4, fontWeight: 500 }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 16 }}>
                  {projet.lien_github && (
                    <a href={projet.lien_github} target="_blank" rel="noopener noreferrer"
                      style={{ color: "#6D7FCC", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
                      GitHub
                    </a>
                  )}
                  {projet.lien_demo && (
                    <a href={projet.lien_demo} target="_blank" rel="noopener noreferrer"
                      style={{ color: "#6D7FCC", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
                      Demo / ressource
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Modal d'upload de fichier */}
      {showUploadModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "90%", maxWidth: 450 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 20, color: "#2B1B24" }}>Ajouter un livrable</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6, color: "#2B1B24" }}>Titre *</label>
              <input
                type="text"
                value={newLivrableTitre}
                onChange={(e) => setNewLivrableTitre(e.target.value)}
                placeholder={`Ex: ${currentUploadDetails.deliverables.split(",")[0]}`}
                style={{ width: "100%", padding: 10, border: "1px solid #EDE3E7", borderRadius: 8, fontSize: 14 }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6, color: "#2B1B24" }}>Fichier *</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                onChange={handleFileChange}
                style={{ width: "100%", padding: 8, border: "1px solid #EDE3E7", borderRadius: 8, fontSize: 13 }}
              />
              <p style={{ fontSize: 11, color: "#9A8090", marginTop: 6 }}>
                Formats acceptes : PDF, Word, JPG, PNG, TXT (max 5MB). Suggestions : {currentUploadDetails.deliverables}
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{ background: "transparent", border: "1px solid #EDE3E7", color: "#9A8090", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14 }}
              >
                Annuler
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                style={{ background: uploading ? "#9A8090" : "#C45C7A", border: "none", color: "#fff", padding: "10px 24px", borderRadius: 8, cursor: uploading ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600 }}
              >
                {uploading ? "Upload en cours..." : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
