import { useState } from "react";
import axios from "axios";
import "./App.css";
import Dashboard from "./Dashboard";
import HomePage from "./HomePage";
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getStrength(pwd) {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}
const strengthColors = ["", "#ef5350", "#D4956A", "#66bb6a"];
const strengthLabels = ["", "Faible", "Moyen", "Fort"];

// Icônes œil
function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

// Champ mot de passe avec icône œil
function PasswordField({ label, placeholder, value, onChange, children }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field-wrap">
      <label className="field-label">{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="field-input"
          required
          style={{ paddingRight: 40 }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{
            position: "absolute", right: 10, top: "50%",
            transform: "translateY(-50%)",
            background: "none", border: "none",
            cursor: "pointer", color: "#9A8090", padding: 0,
            display: "flex", alignItems: "center",
          }}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {children}
    </div>
  );
}

function SimpleField({ label, type, placeholder, value, onChange, children }) {
  return (
    <div className="field-wrap">
      <label className="field-label">{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} className="field-input" required />
      {children}
    </div>
  );
}

function Login({ onSwitch, onLoginSuccess, onBack, onForgot }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await axios.post(`${API}/login`, { email, mot_de_passe: password }, {
        headers: { 'Content-Type': 'application/json' },
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      onLoginSuccess(res.data.user);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Impossible de joindre le serveur.";
      setMsg({ type: "error", text: message });
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel auth-panel--login">
        <div className="circle circle--tl" />
        <div className="circle circle--bl" />
        <div className="circle circle--gold" />
        <div className="panel-content">
          <span className="panel-tag">SHETECH 2026</span>
          <h2 className="panel-title">SheTech</h2>
          <p className="panel-subtitle">Plateforme d'entrepreneuriat numérique féminin</p>
          <div className="panel-divider" />
          {[
            "Formations numériques accessibles",
            "Projets pratiques guidés",
            "Réseau de femmes entrepreneures",
            "Suivi de progression personnalisé",
          ].map((f) => (
            <div key={f} className="feature-item"><div className="feature-dot" />{f}</div>
          ))}
          <div className="auth-proof-row">
            <div><strong>50+</strong><span>formations</span></div>
            <div><strong>8</strong><span>domaines</span></div>
            <div><strong>100%</strong><span>pratique</span></div>
          </div>
        </div>
      </div>

      <div className="auth-form-zone">
        <div className="form-card auth-login-card">
          <button onClick={onBack} className="auth-back-btn">
            &#8592; Retour à l'accueil
          </button>
          <span className="auth-mini-tag">Espace apprenante</span>
          <h1 className="form-title">Bon retour</h1>
          <p className="form-subtitle">Connectez-vous à votre espace SheTech et reprenez votre progression.</p>
          {msg && <div className={`alert alert--${msg.type}`}>{msg.text}</div>}
          <form onSubmit={handleSubmit}>
            <SimpleField label="Adresse e-mail" type="email" placeholder="exemple@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <PasswordField label="Mot de passe" placeholder="Votre mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="forgot-link">
              <span onClick={onForgot} style={{ cursor: "pointer", color: "#C45C7A" }}>Mot de passe oublié ?</span>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>
          <div className="divider">
            <div className="divider-line" /><span className="divider-text">ou</span><div className="divider-line" />
          </div>
          <p className="switch-line">
            Pas encore de compte ?{" "}
            <span className="switch-link" onClick={onSwitch}>S'inscrire gratuitement</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await axios.post(`${API}/forgot-password`, { email });
      setMsg({ type: "success", text: res.data.message });
    } catch (err) {
      setMsg({ type: "error", text: "Erreur serveur. Veuillez réessayer." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="circle circle--tl" />
        <div className="circle circle--bl" />
        <div className="circle circle--gold" />
        <div className="panel-content">
          <span className="panel-tag">SÉCURITÉ</span>
          <h2 className="panel-title">SheTech</h2>
          <p className="panel-subtitle">Réinitialisez votre<br />mot de passe en toute sécurité</p>
          <div className="panel-divider" />
          {["Lien envoyé par email", "Valable 1 heure", "Sécurisé et chiffré", "Gratuit et instantané"].map((f) => (
            <div key={f} className="feature-item"><div className="feature-dot" />{f}</div>
          ))}
        </div>
      </div>
      <div className="auth-form-zone">
        <div className="form-card">
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#9A8090", fontSize: 13, cursor: "pointer", fontFamily: "'Georgia', serif", padding: 0, marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>
            &#8592; Retour à la connexion
          </button>
          <h1 className="form-title">Mot de passe oublié</h1>
          <p className="form-subtitle">Entrez votre email pour recevoir un lien de réinitialisation</p>
          {msg && <div className={`alert alert--${msg.type}`}>{msg.text}</div>}
          <form onSubmit={handleSubmit}>
            <SimpleField label="Adresse e-mail" type="email" placeholder="exemple@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Envoi en cours..." : "Envoyer le lien"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ResetPassword({ onBack }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const token = new URLSearchParams(window.location.search).get('token');

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-form-zone">
          <div className="form-card">
            <h1 className="form-title">Lien invalide</h1>
            <p className="form-subtitle">Ce lien de réinitialisation est invalide ou expiré.</p>
            <button className="btn-primary" onClick={onBack}>Retour à la connexion</button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setMsg({ type: "error", text: "Les mots de passe ne correspondent pas." }); return; }
    if (password.length < 6) { setMsg({ type: "error", text: "Minimum 6 caractères." }); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/reset-password`, { token, newPassword: password });
      setMsg({ type: "success", text: res.data.message });
      setTimeout(() => { window.history.replaceState({}, '', '/'); onBack(); }, 2000);
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Lien invalide ou expiré." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="circle circle--tl" />
        <div className="circle circle--bl" />
        <div className="circle circle--gold" />
        <div className="panel-content">
          <span className="panel-tag">SÉCURITÉ</span>
          <h2 className="panel-title">SheTech</h2>
          <p className="panel-subtitle">Créez un nouveau<br />mot de passe sécurisé</p>
          <div className="panel-divider" />
          {["Minimum 6 caractères", "Mélangez lettres et chiffres", "Évitez les mots simples", "Sécurisé et chiffré"].map((f) => (
            <div key={f} className="feature-item"><div className="feature-dot" />{f}</div>
          ))}
        </div>
      </div>
      <div className="auth-form-zone">
        <div className="form-card">
          <h1 className="form-title">Nouveau mot de passe</h1>
          <p className="form-subtitle">Choisissez un mot de passe sécurisé</p>
          {msg && <div className={`alert alert--${msg.type}`}>{msg.text}</div>}
          <form onSubmit={handleSubmit}>
            <PasswordField label="Nouveau mot de passe" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            <PasswordField label="Confirmer le mot de passe" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer le mot de passe"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Register({ onSwitch, onBack }) {
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", telephone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setMsg({ type: "error", text: "Les mots de passe ne correspondent pas." }); return; }
    const prenom = form.prenom.trim().replace(/\s+/g, " ");
    const nom = form.nom.trim().replace(/\s+/g, " ");
    const email = form.email.trim().toLowerCase();
    if (!prenom || !nom || !email) {
      setMsg({ type: "error", text: "Veuillez renseigner le prénom, le nom et l'email." });
      return;
    }
    if (form.password.length < 6) { setMsg({ type: "error", text: "Minimum 6 caractères." }); return; }
    setLoading(true);
    setMsg(null);
    try {
      const res = await axios.post(`${API}/register`, {
        nom: `${prenom} ${nom}`,
        email,
        mot_de_passe: form.password,
      });
      setMsg({ type: "success", text: res.data.message || "Compte créé avec succès. Vous pouvez vous connecter." });
      setForm({ prenom: "", nom: "", email: "", telephone: "", password: "", confirm: "" });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Erreur lors de l'inscription." });
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(form.password);

  return (
    <div className="auth-page">
      <div className="auth-form-zone auth-form-zone--compact">
        <div className="form-card form-card--wide">
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#9A8090", fontSize: 13, cursor: "pointer", fontFamily: "'Georgia', serif", padding: 0, marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>
            &#8592; Retour à l'accueil
          </button>
          <h1 className="form-title">Créer mon compte</h1>
          <p className="form-subtitle">Rejoignez la communauté SheTech gratuitement</p>
          {msg && <div className={`alert alert--${msg.type}`}>{msg.text}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field-row">
              <SimpleField label="Prénom" type="text" placeholder="Marie" value={form.prenom} onChange={set("prenom")} />
              <SimpleField label="Nom" type="text" placeholder="Dupont" value={form.nom} onChange={set("nom")} />
            </div>
            <SimpleField label="Adresse e-mail" type="email" placeholder="marie@exemple.com" value={form.email} onChange={set("email")} />
            <SimpleField label="Téléphone" type="tel" placeholder="+229 XX XX XX XX" value={form.telephone} onChange={set("telephone")} />
            <PasswordField label="Mot de passe" placeholder="••••••••" value={form.password} onChange={set("password")}>
              {form.password && (
                <>
                  <div className="strength-bar" style={{ background: strengthColors[strength], width: ["0%", "33%", "66%", "100%"][strength] }} />
                  <span className="strength-text">Force : <strong style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</strong></span>
                </>
              )}
            </PasswordField>
            <PasswordField label="Confirmer le mot de passe" placeholder="••••••••" value={form.confirm} onChange={set("confirm")}>
              {form.confirm && form.password !== form.confirm && (
                <span className="field-error">Les mots de passe ne correspondent pas</span>
              )}
            </PasswordField>
            <p className="terms">
              En créant un compte, vous acceptez nos{" "}
              <span className="terms-link">Conditions d'utilisation</span> et notre{" "}
              <span className="terms-link">Politique de confidentialité</span>.
            </p>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Création en cours..." : "Créer mon compte"}
            </button>
          </form>
          <p className="switch-line">
            Déjà un compte ?{" "}
            <span className="switch-link" onClick={onSwitch}>Se connecter</span>
          </p>
        </div>
      </div>

      <div className="auth-panel auth-panel--dark">
        <div className="circle circle--tl-reg" />
        <div className="circle circle--br-reg" />
        <div className="circle circle--gold-reg" />
        <div className="panel-content">
          <span className="panel-tag">REJOIGNEZ-NOUS</span>
          <h2 className="panel-title panel-title--sm">Votre avenir<br />numérique<br />commence ici</h2>
          <p className="panel-subtitle">SheTech accompagne les femmes et jeunes filles africaines vers l'autonomisation économique grâce au numérique.</p>
          <div className="stats-row">
            {[["500+", "Utilisatrices"], ["200+", "Projets créés"], ["85%", "Satisfaction"]].map(([n, l]) => (
              <div key={l}>
                <div className="stat-number">{n}</div>
                <div className="stat-label">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const savedUser = localStorage.getItem("user");
  const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null);

  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('token');
  const [page, setPage] = useState(urlToken ? "reset" : "home");

  const handleLoginSuccess = (userData) => { setUser(userData); setPage("dashboard"); };
  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); setPage("home"); };

  if (user) return <Dashboard user={user} onLogout={handleLogout} />;
  if (page === "login") return <Login onSwitch={() => setPage("register")} onLoginSuccess={handleLoginSuccess} onBack={() => setPage("home")} onForgot={() => setPage("forgot")} />;
  if (page === "forgot") return <ForgotPassword onBack={() => setPage("login")} />;
  if (page === "reset") return <ResetPassword onBack={() => setPage("login")} />;
  if (page === "register") return <Register onSwitch={() => setPage("login")} onBack={() => setPage("home")} />;
  return <HomePage onLogin={() => setPage("login")} onRegister={() => setPage("register")} />;
}
