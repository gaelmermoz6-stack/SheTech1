import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "./lib/api";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const fmt = (n) => Number(n || 0).toLocaleString("fr-FR");
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const C = {
  bg:       "#F8F2F5",
  surface:  "#FFFFFF",
  surfaceHover: "#FFF9FB",
  text:     "#2B1B24",
  textSub:  "#6D2E46",
  textMuted:"#9A8090",
  border:   "#EDE3E7",
  borderHover: "#D9B8C6",
  accent:   "#C45C7A",
  accentDark:"#6D2E46",
  accentPale:"#F9F0F3",
  accentMid: "#ECD8DF",
  danger:   "#C0392B",
  dangerPale:"#FDF2F1",
  sidebarBg: "#2B1B24",
  sidebarText:"rgba(255,255,255,0.5)",
  sidebarActive:"rgba(255,255,255,0.92)",
};

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideRight { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes drawerIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
  @keyframes scaleUp { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes barIn { from { width: 0; } }
  @keyframes adminGlow { 0%, 100% { transform: translateY(0); opacity: 0.75; } 50% { transform: translateY(-8px); opacity: 1; } }
  @keyframes adminSoftFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
  @keyframes adminLineSweep { from { transform: translateX(-120%); } to { transform: translateX(120%); } }
  @keyframes adminCardRise { from { opacity: 0; transform: translateY(22px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
  * { box-sizing: border-box; }
  .action-btn { opacity: 0.4; transition: opacity 0.15s ease, background 0.15s ease, color 0.15s ease, transform 0.15s ease; }
  .lesson-row:hover .action-btn, .module-header:hover .action-btn { opacity: 1; }
  .action-btn:hover { transform: scale(1.04); }
  .lesson-row { transition: background 0.12s ease; }
  .lesson-row:hover { background: #FFF9FB !important; }
  .admin-shell button, .admin-shell a { transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, color 0.18s ease, border-color 0.18s ease; }
  .admin-shell button:hover { transform: translateY(-1px); }
  .admin-content-card { box-shadow: 0 18px 42px rgba(43,27,36,0.06); position: relative; overflow: hidden; }
  .admin-kpi-card { animation: adminCardRise 0.52s cubic-bezier(.22,1,.36,1) both; }
  .admin-content-card::after { content: ""; position: absolute; inset: 0; background: linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.7) 45%, transparent 75%); transform: translateX(-120%); pointer-events: none; }
  .admin-content-card:hover::after { animation: adminLineSweep 0.7s ease; }
  input:focus, textarea:focus, select:focus { outline: none; border-color: #B04E6A !important; box-shadow: 0 0 0 3px #F9F0F3 !important; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #E8E6E3; border-radius: 10px; }
`;

function injectStyles() {
  if (document.getElementById("shetech-v3")) return;
  const el = document.createElement("style");
  el.id = "shetech-v3";
  el.textContent = GLOBAL_STYLES;
  document.head.appendChild(el);
}

const Icon = {
  dashboard: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  users:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  formations:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  stats:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  plus:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  video:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  ai:        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/><path d="M22 2l-4 4 4 4"/></svg>,
  check:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  lock:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  arrow:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  logout:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  back:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  spinner:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.75s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  sparkle:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>,
  save:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
};

const ROLE_CFG = {
  apprenante: { label: "Apprenante" },
  mentor:     { label: "Mentor" },
  admin:      { label: "Admin" },
};

const ADMIN_ROLE_FILTERS = ["tous", "apprenante", "admin"];
const ADMIN_ROLE_OPTIONS = ["apprenante", "admin"];

// ── Mentorat retiré du menu ──
const NAV_ITEMS = [
  { id: "dashboard",  label: "Tableau de bord", icon: Icon.dashboard },
  { id: "users",      label: "Utilisateurs",    icon: Icon.users },
  { id: "formations", label: "Formations",      icon: Icon.formations },
  { id: "stats",      label: "Statistiques",    icon: Icon.stats },
];

const DOMAINES_LIST = [
  { id: "developpement", titre: "Développement Web" },
  { id: "ia",            titre: "Intelligence Artificielle" },
  { id: "marketing",     titre: "Marketing Digital" },
  { id: "ecommerce",     titre: "E-commerce" },
  { id: "leadership",    titre: "Leadership & Business" },
  { id: "freelance",     titre: "Freelance & Entrepreneuriat" },
  { id: "design",        titre: "Design UI/UX" },
  { id: "cybersecurite", titre: "Cybersécurité" },
];

function useAnimateIn(delay = 0) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.opacity = "0";
    const t = setTimeout(() => {
      if (ref.current) {
        ref.current.style.animation = `fadeUp 0.35s cubic-bezier(.22,1,.36,1) ${delay}ms both`;
        ref.current.style.opacity = "";
      }
    }, 20);
    return () => clearTimeout(t);
  }, [delay]);
  return ref;
}

function Badge({ role }) {
  const label = ROLE_CFG[role]?.label || role;
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
      background: C.border, color: C.textSub, textTransform: "uppercase",
      letterSpacing: "0.05em", display: "inline-block" }}>
      {label}
    </span>
  );
}

function TypeBadge({ type }) {
  const labels = { video: "Vidéo", texte: "Lecture", quiz: "Quiz" };
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
      background: C.border, color: C.textSub, textTransform: "uppercase",
      letterSpacing: "0.05em", flexShrink: 0 }}>
      {labels[type] || type}
    </span>
  );
}

function KpiCard({ label, value, sub, delay = 0, tone = "rose" }) {
  const ref = useAnimateIn(delay);
  const toneColors = {
    rose: "#C45C7A",
    green: "#4CAF8A",
    gold: "#E8A554",
    plum: "#6D7FCC",
  };
  const toneColor = toneColors[tone] || toneColors.rose;
  return (
    <div ref={ref} className="admin-content-card admin-kpi-card" style={{
      background: "rgba(255,255,255,0.88)",
      border: `1px solid ${C.border}`,
      borderTop: `4px solid ${toneColor}`,
      borderRadius: 8,
      padding: "20px",
      flex: 1,
      minWidth: 0,
      transition: "box-shadow 0.24s ease, transform 0.24s ease, border-color 0.24s ease",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 24px 54px rgba(43,27,36,0.14)"; e.currentTarget.style.transform = "translateY(-7px) scale(1.015)"; e.currentTarget.style.borderColor = toneColor; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}>
      <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 800,
        textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 800, color: C.text,
        lineHeight: 1, marginBottom: 8 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ padding: "48px", textAlign: "center", color: C.textMuted,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 13 }}>
      {Icon.spinner} Chargement…
    </div>
  );
}

function EmptyState({ message = "Aucune donnée" }) {
  return (
    <div style={{ padding: "40px", textAlign: "center", color: C.textMuted,
      fontSize: 13, background: C.surface, borderRadius: 10,
      border: `1.5px dashed ${C.border}`, animation: "fadeIn 0.3s ease both" }}>
      {message}
    </div>
  );
}

function SectionTitle({ children, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      marginBottom: 22, animation: "fadeUp 0.3s ease both" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0,
        fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.3px" }}>
        {children}
      </h2>
      {action}
    </div>
  );
}

function BtnPrimary({ onClick, children, disabled, icon, type }) {
  return (
    <button onClick={onClick} disabled={disabled} type={type || "button"}
      style={{ padding: "9px 18px", borderRadius: 8, border: "none",
        background: disabled ? C.border : C.accent,
        color: disabled ? C.textMuted : "#fff",
        fontSize: 13, fontWeight: 600, cursor: disabled ? "default" : "pointer",
        fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 7,
        transition: "background 0.15s, transform 0.15s, box-shadow 0.15s",
        boxShadow: disabled ? "none" : "0 2px 8px rgba(176,78,106,0.25)" }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = C.accentDark; e.currentTarget.style.transform = "translateY(-1px)"; }}}
      onMouseLeave={(e) => { e.currentTarget.style.background = disabled ? C.border : C.accent; e.currentTarget.style.transform = ""; }}>
      {icon && icon}{children}
    </button>
  );
}

function BtnNeutral({ onClick, children, icon }) {
  return (
    <button type="button" onClick={onClick}
      style={{ padding: "7px 13px", borderRadius: 7, border: `1px solid ${C.border}`,
        background: C.surface, color: C.textSub, fontSize: 12, fontWeight: 500,
        cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        display: "flex", alignItems: "center", gap: 6,
        transition: "border-color 0.15s, color 0.15s, background 0.15s" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.style.color = C.text; e.currentTarget.style.background = C.surfaceHover; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSub; e.currentTarget.style.background = C.surface; }}>
      {icon && icon}{children}
    </button>
  );
}

function IconBtn({ onClick, icon, danger, title }) {
  return (
    <button onClick={onClick} title={title} className="action-btn"
      style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`,
        background: C.surface, color: danger ? C.danger : C.textSub,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s ease" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "1";
        if (danger) { e.currentTarget.style.background = C.dangerPale; e.currentTarget.style.borderColor = C.danger; }
        else { e.currentTarget.style.background = C.surfaceHover; e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.style.color = C.text; }
      }}
      onMouseLeave={(e) => { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = danger ? C.danger : C.textSub; }}>
      {icon}
    </button>
  );
}

function BtnDanger({ onClick, children, icon }) {
  return (
    <button onClick={onClick}
      style={{ padding: "7px 13px", borderRadius: 7, border: `1px solid ${C.danger}`,
        background: C.dangerPale, color: C.danger, fontSize: 12, fontWeight: 500,
        cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        display: "flex", alignItems: "center", gap: 6,
        transition: "background 0.15s" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "#FAEAEA"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = C.dangerPale; }}>
      {icon && icon}{children}
    </button>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 13px", borderRadius: 8,
  border: `1px solid ${C.border}`, fontSize: 13, color: C.text,
  fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
  background: "#FDFCFB", transition: "border-color 0.2s, box-shadow 0.2s",
};

function Input({ label, value, onChange, type = "text", placeholder, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: C.textSub,
        display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}{required && <span style={{ color: C.accent, marginLeft: 3 }}>*</span>}
      </label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={inputStyle} />
    </div>
  );
}

function Select({ label, value, onChange, options, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: C.textSub,
        display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}{required && <span style={{ color: C.accent, marginLeft: 3 }}>*</span>}
      </label>}
      <select value={value} onChange={onChange} style={{ ...inputStyle, cursor: "pointer" }}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder, rows = 4 }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: C.textSub,
        display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </label>}
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
        style={{ ...inputStyle, resize: "vertical" }} />
    </div>
  );
}

function Drawer({ open, onClose, title, children, width = 460 }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.35)", zIndex: 100, backdropFilter: "blur(2px)",
        animation: "fadeIn 0.2s ease both" }} />
      <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width,
        background: C.surface, zIndex: 101, display: "flex", flexDirection: "column",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
        animation: "drawerIn 0.28s cubic-bezier(.22,1,.36,1) both" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text,
            fontFamily: "'Playfair Display', Georgia, serif" }}>{title}</h3>
          <button onClick={onClose}
            style={{ background: C.border, border: "none", width: 28, height: 28,
              borderRadius: "50%", color: C.textSub, cursor: "pointer", fontSize: 15,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.15s" }}
            onMouseEnter={(e) => e.currentTarget.style.background = C.borderHover}
            onMouseLeave={(e) => e.currentTarget.style.background = C.border}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>{children}</div>
      </div>
    </>
  );
}

function ConfirmModal({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
        zIndex: 200, animation: "fadeIn 0.2s ease both" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)", background: C.surface,
        borderRadius: 14, padding: "28px 32px", zIndex: 201, width: 380,
        boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
        animation: "scaleUp 0.22s cubic-bezier(.22,1,.36,1) both" }}>
        <p style={{ fontSize: 14, color: C.text, margin: "0 0 22px", lineHeight: 1.65 }}>{message}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <BtnNeutral onClick={onCancel}>Annuler</BtnNeutral>
          <BtnDanger onClick={onConfirm} icon={Icon.trash}>Supprimer</BtnDanger>
        </div>
      </div>
    </>
  );
}

function Table({ cols, data, loading, empty = "Aucune donnée" }) {
  if (loading) return <Spinner />;
  if (!data.length) return <EmptyState message={empty} />;
  return (
    <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`,
      overflow: "hidden", animation: "fadeUp 0.3s ease both" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: C.bg }}>
            {cols.map((c) => (
              <th key={c.key} style={{ padding: "11px 16px", textAlign: "left", fontSize: 10,
                fontWeight: 700, color: C.textMuted, textTransform: "uppercase",
                letterSpacing: "0.09em", borderBottom: `1px solid ${C.border}` }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < data.length - 1 ? `1px solid ${C.border}` : "none",
              transition: "background 0.1s", animation: `fadeUp 0.28s ease ${i * 35}ms both` }}
              onMouseEnter={(e) => e.currentTarget.style.background = C.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = ""}>
              {cols.map((c) => (
                <td key={c.key} style={{ padding: "12px 16px", fontSize: 13, color: C.text,
                  verticalAlign: "middle" }}>
                  {c.render ? c.render(row[c.key], row) : row[c.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({ page, total, perPage, onChange }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 18 }}>
      {[...Array(pages)].map((_, i) => (
        <button key={i} onClick={() => onChange(i + 1)}
          style={{ width: 32, height: 32, borderRadius: 7,
            border: `1px solid ${page === i + 1 ? C.accent : C.border}`,
            background: page === i + 1 ? C.accent : C.surface,
            color: page === i + 1 ? "#fff" : C.textSub,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" }}>
          {i + 1}
        </button>
      ))}
    </div>
  );
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// QUIZ MANAGER
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function QuizManager({ module: mod, onClose }) {
  const [etape, setEtape] = useState("config");
  const [nbQuestions, setNbQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [existingQuiz, setExistingQuiz] = useState([]);
  const [loadingExisting, setLoadingExisting] = useState(true);

  useEffect(() => {
    api.get(`/modules/${mod.id}/quiz/admin`, { headers: getHeaders() })
      .then((r) => setExistingQuiz(r.data))
      .catch(() => setExistingQuiz([]))
      .finally(() => setLoadingExisting(false));
  }, [mod.id]);

  const generer = async () => {
    setLoading(true); setErreur(null);
    try {
      const r = await api.post(`/modules/${mod.id}/generate-quiz`,
        { nb_questions: nbQuestions }, { headers: getHeaders() });
      setQuestions(r.data.questions); setEtape("preview");
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur de génération.");
    } finally { setLoading(false); }
  };

  const sauvegarder = async () => {
    setLoading(true);
    try {
      await api.post(`/modules/${mod.id}/quiz`, { questions }, { headers: getHeaders() });
      setEtape("saved"); setExistingQuiz(questions);
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur sauvegarde.");
    } finally { setLoading(false); }
  };

  const updateQuestion = (idx, field, value) =>
    setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  const supprimerQuestion = (idx) =>
    setQuestions((prev) => prev.filter((_, i) => i !== idx));

  const REPONSES = ["a", "b", "c", "d"];
  const LABELS = { a: "A", b: "B", c: "C", d: "D" };

  return (
    <div>
      <div style={{ background: C.bg, borderRadius: 10, padding: "12px 16px",
        marginBottom: 22, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Module</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{mod.titre}</div>
        {existingQuiz.length > 0 && (
          <div style={{ fontSize: 12, color: "#059669", marginTop: 6,
            display: "flex", alignItems: "center", gap: 5, fontWeight: 500 }}>
            {Icon.check} {existingQuiz.length} question(s) existante(s)
          </div>
        )}
      </div>

      {etape === "config" && (
        <div style={{ animation: "fadeUp 0.3s ease both" }}>
          <p style={{ fontSize: 13, color: C.textSub, marginBottom: 22, lineHeight: 1.7 }}>
            L'IA analyse le contenu des leçons et génère des QCM automatiquement.
          </p>
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.textSub,
              display: "block", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Nombre de questions
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {[3, 5, 7, 10].map((n) => (
                <button key={n} onClick={() => setNbQuestions(n)}
                  style={{ padding: "9px 16px", borderRadius: 8,
                    border: `1px solid ${nbQuestions === n ? C.accent : C.border}`,
                    background: nbQuestions === n ? C.accent : C.surface,
                    color: nbQuestions === n ? "#fff" : C.textSub,
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" }}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          {erreur && <div style={{ background: C.dangerPale, border: `1px solid ${C.danger}`,
            borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: C.danger }}>
            {erreur}</div>}
          <BtnPrimary onClick={generer} disabled={loading} icon={loading ? Icon.spinner : Icon.sparkle}>
            {loading ? "Génération…" : "Générer le quiz"}
          </BtnPrimary>
          {existingQuiz.length > 0 && !loadingExisting && (
            <div style={{ marginTop: 26, paddingTop: 22, borderTop: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textSub,
                textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
                Questions actuelles
              </div>
              {existingQuiz.map((q, i) => (
                <div key={i} style={{ background: C.bg, borderRadius: 8, padding: "10px 14px",
                  marginBottom: 8, border: `1px solid ${C.border}`,
                  animation: `fadeUp 0.25s ease ${i * 40}ms both` }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 4 }}>
                    {i + 1}. {q.question}
                  </div>
                  <div style={{ fontSize: 11, color: "#059669", display: "flex", alignItems: "center", gap: 4 }}>
                    {Icon.check} {LABELS[q.reponse_correcte]} — {q[`option_${q.reponse_correcte}`]}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {etape === "preview" && (
        <div style={{ animation: "fadeUp 0.3s ease both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{questions.length} questions générées</span>
            <button onClick={() => setEtape("config")}
              style={{ background: "none", border: "none", color: C.textMuted,
                fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              {Icon.back} Recommencer
            </button>
          </div>
          {questions.map((q, idx) => (
            <div key={idx} style={{ background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "16px", marginBottom: 12,
              animation: `fadeUp 0.28s ease ${idx * 50}ms both` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: C.textMuted,
                  textTransform: "uppercase", letterSpacing: "0.07em" }}>Q{idx + 1}</span>
                <button onClick={() => supprimerQuestion(idx)}
                  style={{ background: "none", border: "none", color: C.danger,
                    fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                  {Icon.trash} Retirer
                </button>
              </div>
              <textarea value={q.question} rows={2}
                onChange={(e) => updateQuestion(idx, "question", e.target.value)}
                style={{ ...inputStyle, marginBottom: 12, fontWeight: 500 }} />
              {REPONSES.map((r) => (
                <div key={r} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <button onClick={() => updateQuestion(idx, "reponse_correcte", r)}
                    style={{ width: 28, height: 28, borderRadius: "50%", border: "none", flexShrink: 0,
                      background: q.reponse_correcte === r ? "#059669" : C.border,
                      color: q.reponse_correcte === r ? "#fff" : C.textMuted,
                      fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                    {LABELS[r]}
                  </button>
                  <input value={q[`option_${r}`] || ""}
                    onChange={(e) => updateQuestion(idx, `option_${r}`, e.target.value)}
                    style={{ ...inputStyle, flex: 1,
                      borderColor: q.reponse_correcte === r ? "#059669" : C.border,
                      background: q.reponse_correcte === r ? "#EDFAF3" : "#FDFCFB" }} />
                </div>
              ))}
              <input value={q.explication || ""}
                onChange={(e) => updateQuestion(idx, "explication", e.target.value)}
                placeholder="Explication (optionnel)…"
                style={{ ...inputStyle, marginTop: 8, borderStyle: "dashed", color: C.textMuted, fontSize: 12 }} />
            </div>
          ))}
          {erreur && <div style={{ background: C.dangerPale, border: `1px solid ${C.danger}`,
            borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.danger }}>
            {erreur}</div>}
          <BtnPrimary onClick={sauvegarder} disabled={loading || questions.length === 0}
            icon={loading ? Icon.spinner : Icon.save}>
            {loading ? "Sauvegarde…" : `Sauvegarder ${questions.length} question(s)`}
          </BtnPrimary>
        </div>
      )}

      {etape === "saved" && (
        <div style={{ textAlign: "center", padding: "40px 20px",
          animation: "scaleUp 0.35s cubic-bezier(.22,1,.36,1) both" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", margin: "0 auto 20px",
            background: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text,
            fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>Quiz sauvegardé</div>
          <div style={{ fontSize: 13, color: C.textSub, marginBottom: 26, lineHeight: 1.7 }}>
            {questions.length} questions associées au module.<br/>
            Score minimum requis : 70% pour débloquer la suite.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <BtnNeutral onClick={() => setEtape("config")}>Voir le quiz</BtnNeutral>
            <BtnPrimary onClick={onClose}>Fermer</BtnPrimary>
          </div>
        </div>
      )}
    </div>
  );
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// FORMULAIRE LEÇON
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function LeconFormDrawer({ open, onClose, moduleId, onSuccess }) {
  const [titre, setTitre] = useState("");
  const [type, setType] = useState("video");
  const [videoUrl, setVideoUrl] = useState("");
  const [contenuTexte, setContenuTexte] = useState("");
  const [duree, setDuree] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!titre) { alert("Le titre est obligatoire"); return; }
    setLoading(true);
    try {
      await api.post(`/lecons`, {
        module_id: moduleId, titre, type,
        video_url: videoUrl, contenu_texte: contenuTexte, duree
      }, { headers: getHeaders() });
      onSuccess();
      resetForm();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    } finally { setLoading(false); }
  };

  const resetForm = () => {
    setTitre(""); setType("video"); setVideoUrl(""); setContenuTexte(""); setDuree("");
  };

  return (
    <Drawer open={open} onClose={() => { resetForm(); onClose(); }} title="Nouvelle leçon" width={500}>
      <div>
        <Input label="Titre de la leçon" value={titre} required onChange={(e) => setTitre(e.target.value)} />
        <Select label="Type" value={type} onChange={(e) => setType(e.target.value)}
          options={[
            { value: "video", label: "Vidéo" },
            { value: "texte", label: "Texte / Lecture" },
            { value: "quiz", label: "Quiz" }
          ]} />
        <Input label="Durée" value={duree} placeholder="ex : 15 min" onChange={(e) => setDuree(e.target.value)} />
        {type === "video" && (
          <Input label="URL YouTube" value={videoUrl} placeholder="https://www.youtube.com/watch?v=..."
            onChange={(e) => setVideoUrl(e.target.value)} />
        )}
        {(type === "video" || type === "texte") && (
          <Textarea label={type === "video" ? "Contenu texte (optionnel)" : "Contenu texte"}
            value={contenuTexte} rows={5} placeholder="Notes, description, ressources…"
            onChange={(e) => setContenuTexte(e.target.value)} />
        )}
        <BtnPrimary onClick={handleSubmit} disabled={loading || !titre} icon={loading ? Icon.spinner : Icon.plus}>
          {loading ? "Création..." : "Créer la leçon"}
        </BtnPrimary>
      </div>
    </Drawer>
  );
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// SECTION DASHBOARD
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function SectionDashboard() {
  const [users, setUsers] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const h = getHeaders();
    Promise.all([
      api.get(`/admin/users`, { headers: h }).catch(() => ({ data: MOCK.users })),
      api.get(`/formations`, { headers: h }).catch(() => ({ data: MOCK.formations })),
    ]).then(([u, f]) => {
      setUsers(u.data); setFormations(f.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24, borderRadius: 16, padding: "26px 28px",
        background: "linear-gradient(135deg, #2B1B24 0%, #6D2E46 100%)",
        color: "#fff", boxShadow: "0 20px 48px rgba(43,27,36,0.18)",
        animation: "fadeUp 0.3s ease both, adminSoftFloat 6s ease-in-out infinite" }}>
        <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "#F0A6BB" }}>
          Vue générale
        </span>
        <h1 style={{ fontSize: 34, fontWeight: 800, margin: "8px 0 8px",
          fontFamily: "'Playfair Display', Georgia, serif" }}>
          Tableau de bord admin
        </h1>
        <p style={{ margin: 0, maxWidth: 640, color: "rgba(255,255,255,0.72)", fontSize: 14, lineHeight: 1.65 }}>
          Suivez les utilisatrices, les formations et les activités importantes de la plateforme SheTech.
        </p>
      </div>
      <div style={{ display: "flex", gap: 14, marginBottom: 30, flexWrap: "wrap" }}>
        <KpiCard label="Utilisatrices" value={fmt(users.length)} sub="Comptes enregistrés" delay={0} tone="rose" />
        <KpiCard label="Formations" value={fmt(formations.length)} sub="Formations publiées" delay={80} tone="green" />
        <KpiCard label="Progression" value="68%" sub="Moyenne globale" delay={160} tone="gold" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <SectionTitle>Dernières inscriptions</SectionTitle>
          <Table loading={loading}
            cols={[
              { key: "nom",           label: "Nom" },
              { key: "email",         label: "Email",  render: (v) => <span style={{ color: C.textMuted, fontSize: 12 }}>{v}</span> },
              { key: "role",          label: "Rôle",   render: (v) => <Badge role={v} /> },
              { key: "date_creation", label: "Date",   render: (v) => <span style={{ fontSize: 12, color: C.textMuted }}>{fmtDate(v)}</span> },
            ]}
            data={users.slice(0, 5)} empty="Aucune inscription récente" />
        </div>
        <div>
          <SectionTitle>Formations récentes</SectionTitle>
          {loading ? <Spinner /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {formations.slice(0, 4).map((f, i) => (
                <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: "13px 16px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  animation: `fadeUp 0.28s ease ${i * 55}ms both`,
                  borderLeft: `3px solid ${C.accent}`, transition: "box-shadow 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = ""}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{f.titre}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{f.niveau}</div>
                  </div>
                  <span style={{ color: C.textMuted }}>{Icon.arrow}</span>
                </div>
              ))}
              {formations.length === 0 && <EmptyState message="Aucune formation" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// SECTION USERS
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function SectionUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [filtreRole, setFiltreRole] = useState("tous");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/admin/users`, { headers: getHeaders() })
      .then((r) => setUsers(r.data))
      .catch(() => setUsers(MOCK.users))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeRole = (id, role) => {
    api.put(`/admin/users/${id}/role`, { role }, { headers: getHeaders() })
      .then(() => setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u)))
      .catch(() => alert("Erreur lors du changement de rôle"));
  };

  const filtered = users.filter((u) => {
    const matchR = filtreRole === "tous" || u.role === filtreRole;
    const matchS = !recherche || u.nom?.toLowerCase().includes(recherche.toLowerCase()) || u.email?.toLowerCase().includes(recherche.toLowerCase());
    return matchR && matchS;
  });
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div>
      <SectionTitle>
        Utilisateurs
        <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 500,
          background: C.border, padding: "3px 10px", borderRadius: 20 }}>
          {filtered.length}
        </span>
      </SectionTitle>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <input value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }}
          placeholder="Rechercher…"
          style={{ ...inputStyle, flex: 1, minWidth: 200, width: "auto" }} />
        {ADMIN_ROLE_FILTERS.map((r) => (
          <button key={r} onClick={() => { setFiltreRole(r); setPage(1); }}
            style={{ padding: "7px 14px", borderRadius: 20,
              border: `1px solid ${filtreRole === r ? C.accent : C.border}`,
              background: filtreRole === r ? C.accent : C.surface,
              color: filtreRole === r ? "#fff" : C.textSub,
              fontSize: 12, fontWeight: 500, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" }}>
            {r === "tous" ? "Tous" : ROLE_CFG[r]?.label || r}
          </button>
        ))}
      </div>
      <Table loading={loading}
        cols={[
          { key: "nom",   label: "Nom",   render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
          { key: "email", label: "Email", render: (v) => <span style={{ color: C.textMuted, fontSize: 12 }}>{v}</span> },
          { key: "role",  label: "Rôle",  render: (v, row) => (
            <select value={v} onChange={(e) => changeRole(row.id, e.target.value)}
              style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${C.border}`,
                fontSize: 12, color: C.text, fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer", background: C.bg }}>
              {!ADMIN_ROLE_OPTIONS.includes(v) && <option value={v}>{ROLE_CFG[v]?.label || v}</option>}
              {ADMIN_ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>{ROLE_CFG[role]?.label || role}</option>
              ))}
            </select>
          )},
          { key: "niveau",        label: "Niveau",      render: (v) => <span style={{ fontSize: 12, color: C.textMuted }}>{v || "—"}</span> },
          { key: "date_creation", label: "Inscription", render: (v) => <span style={{ fontSize: 12, color: C.textMuted }}>{fmtDate(v)}</span> },
        ]}
        data={paginated} empty="Aucun utilisateur trouvé" />
      <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
    </div>
  );
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// SECTION FORMATIONS
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function SectionFormations() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [detail, setDetail]         = useState(null);
  const [detailData, setDetailData] = useState(null);

  const [drawerF, setDrawerF]         = useState(false);
  const [drawerM, setDrawerM]         = useState(false);
  const [leconDrawerOpen, setLeconDrawerOpen] = useState(false);
  const [selectedModuleForLecon, setSelectedModuleForLecon] = useState(null);
  const [drawerV, setDrawerV]         = useState(false);
  const [drawerEditM, setDrawerEditM] = useState(false);
  const [drawerEditL, setDrawerEditL] = useState(false);
  const [drawerEditV, setDrawerEditV] = useState(false);
  const [drawerQuiz, setDrawerQuiz]   = useState(false);

  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLecon, setSelectedLecon]   = useState(null);
  const [editingModule, setEditingModule]   = useState(null);
  const [editingLecon, setEditingLecon]     = useState(null);
  const [editingVideo, setEditingVideo]     = useState(null);
  const [quizModule, setQuizModule]         = useState(null);
  const [confirmDel, setConfirmDel] = useState({ open: false, message: "", onConfirm: null });
  const [erreurVideo, setErreurVideo] = useState(null);

  const [fForm, setFForm] = useState({ titre: "", description: "", niveau: "Débutant", domaine: "developpement" });
  const [mForm, setMForm] = useState({ titre: "", duree: "" });
  const [vForm, setVForm] = useState({ titre: "", url: "", description: "", duree: "" });
  const [editMForm, setEditMForm] = useState({ titre: "", duree: "" });
  const [editLForm, setEditLForm] = useState({ titre: "", type: "video", video_url: "", contenu_texte: "", duree: "" });
  const [editVForm, setEditVForm] = useState({ titre: "", url: "", description: "", duree: "" });

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/formations`, { headers: getHeaders() })
      .then((r) => setFormations(r.data))
      .catch(() => setFormations(MOCK.formations))
      .finally(() => setLoading(false));
  }, []);

  const loadDetail = useCallback((formation) => {
    setDetail(formation); setDetailData(null);
    api.get(`/formations/${formation.id}`, { headers: getHeaders() })
      .then((r) => setDetailData(r.data))
      .catch(() => setDetailData({ formation, modules: MOCK.modules }));
  }, []);

  useEffect(() => { load(); }, [load]);

  const getYoutubeId = (url) => {
    if (!url) return "";
    if (url.includes("watch?v=")) return new URLSearchParams(url.split("?")[1]).get("v") || "";
    const clean = url.split("?")[0];
    if (clean.includes("youtu.be/")) return clean.split("youtu.be/")[1];
    return "";
  };

  const creerFormation = () => {
    api.post(`/formations`, fForm, { headers: getHeaders() })
      .then(() => { load(); setDrawerF(false); setFForm({ titre: "", description: "", niveau: "Débutant", domaine: "developpement" }); })
      .catch((err) => alert(err.response?.data?.message || "Erreur"));
  };
  const creerModule = () => {
    if (!detail?.id) return;
    api.post(`/modules`, { formation_id: detail.id, ...mForm }, { headers: getHeaders() })
      .then(() => { loadDetail(detail); setDrawerM(false); setMForm({ titre: "", duree: "" }); })
      .catch((err) => alert(err.response?.data?.message || "Erreur"));
  };
  const ajouterVideo = () => {
    setErreurVideo(null);
    if (!selectedLecon) { setErreurVideo("Aucune leçon sélectionnée."); return; }
    if (!vForm.titre)   { setErreurVideo("Le titre est obligatoire."); return; }
    if (!vForm.url)     { setErreurVideo("L'URL YouTube est obligatoire."); return; }
    api.post(`/lecons/${selectedLecon}/videos`, vForm, { headers: getHeaders() })
      .then(() => { loadDetail(detail); setDrawerV(false); setVForm({ titre: "", url: "", description: "", duree: "" }); })
      .catch((err) => setErreurVideo("Erreur : " + (err.response?.data?.message || err.message)));
  };
  const modifierModule = () => {
    api.put(`/modules/${editingModule.id}`, editMForm, { headers: getHeaders() })
      .then(() => { loadDetail(detail); setDrawerEditM(false); })
      .catch((err) => alert(err.response?.data?.message || "Erreur"));
  };
  const modifierLecon = () => {
    api.put(`/lecons/${editingLecon.id}`, editLForm, { headers: getHeaders() })
      .then(() => { loadDetail(detail); setDrawerEditL(false); })
      .catch((err) => alert(err.response?.data?.message || "Erreur"));
  };
  const modifierVideo = () => {
    api.put(`/videos/${editingVideo.id}`, editVForm, { headers: getHeaders() })
      .then(() => { loadDetail(detail); setDrawerEditV(false); })
      .catch((err) => alert(err.response?.data?.message || "Erreur"));
  };

  const supprimerFormation = (f) => {
    setConfirmDel({ open: true, message: `Supprimer "${f.titre}" ? Tous ses modules seront supprimés.`,
      onConfirm: () => api.delete(`/formations/${f.id}`, { headers: getHeaders() })
        .then(() => { load(); setConfirmDel({ open: false }); })
        .catch(() => setConfirmDel({ open: false })) });
  };
  const supprimerModule = (mod) => {
    setConfirmDel({ open: true, message: `Supprimer le module "${mod.titre}" et toutes ses leçons ?`,
      onConfirm: () => api.delete(`/modules/${mod.id}`, { headers: getHeaders() })
        .then(() => { loadDetail(detail); setConfirmDel({ open: false }); })
        .catch(() => setConfirmDel({ open: false })) });
  };
  const supprimerLecon = (l) => {
    setConfirmDel({ open: true, message: `Supprimer la leçon "${l.titre}" ?`,
      onConfirm: () => api.delete(`/lecons/${l.id}`, { headers: getHeaders() })
        .then(() => { loadDetail(detail); setConfirmDel({ open: false }); })
        .catch(() => setConfirmDel({ open: false })) });
  };
  const supprimerVideo = (v) => {
    setConfirmDel({ open: true, message: `Supprimer la vidéo "${v.titre}" ?`,
      onConfirm: () => api.delete(`/videos/${v.id}`, { headers: getHeaders() })
        .then(() => { loadDetail(detail); setConfirmDel({ open: false }); })
        .catch(() => setConfirmDel({ open: false })) });
  };

  if (detail) {
    const modules = detailData?.modules || [];
    return (
      <div>
        <button onClick={() => { setDetail(null); setDetailData(null); }}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none",
            border: "none", color: C.textMuted, fontSize: 13, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", marginBottom: 24, padding: 0, transition: "color 0.15s" }}
          onMouseEnter={(e) => e.currentTarget.style.color = C.text}
          onMouseLeave={(e) => e.currentTarget.style.color = C.textMuted}>
          {Icon.back} <span>Formations</span>
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          marginBottom: 16, animation: "fadeUp 0.3s ease both" }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 8px",
              fontFamily: "'Playfair Display', Georgia, serif" }}>{detail.titre}</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ fontSize: 11, background: C.border, color: C.textSub,
                padding: "3px 10px", borderRadius: 20, fontWeight: 500 }}>{detail.niveau}</span>
              <span style={{ fontSize: 11, background: C.border, color: C.textSub,
                padding: "3px 10px", borderRadius: 20, fontWeight: 500 }}>{detail.domaine}</span>
            </div>
          </div>
          <BtnPrimary onClick={() => setDrawerM(true)} icon={Icon.plus}>Nouveau module</BtnPrimary>
        </div>
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10,
          padding: "11px 16px", marginBottom: 24, display: "flex", alignItems: "flex-start", gap: 10,
          animation: "fadeUp 0.35s ease both" }}>
          <span style={{ color: C.textMuted, flexShrink: 0, marginTop: 1 }}>{Icon.lock}</span>
          <p style={{ fontSize: 12, color: C.textSub, margin: 0, lineHeight: 1.65 }}>
            Le bouton <strong style={{ color: C.text }}>Quiz IA</strong> génère automatiquement un quiz.
            Score minimum : <strong style={{ color: C.text }}>70%</strong> pour accéder au module suivant.
          </p>
        </div>
        {!detailData ? <Spinner /> : modules.length === 0 ? (
          <EmptyState message="Aucun module — cliquez « Nouveau module » pour commencer." />
        ) : (
          modules.map((mod, mi) => (
            <div key={mod.id || mi} className="module-block"
              style={{ background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 12, marginBottom: 12, overflow: "hidden",
                animation: `fadeUp 0.3s ease ${mi * 55}ms both` }}>
              <div className="module-header"
                style={{ padding: "13px 18px", background: C.bg, borderBottom: `1px solid ${C.border}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{mod.titre}</span>
                  {mod.duree && (
                    <span style={{ fontSize: 11, color: C.textMuted, background: C.surface,
                      border: `1px solid ${C.border}`, padding: "2px 8px", borderRadius: 20 }}>{mod.duree}</span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <BtnNeutral onClick={() => { setSelectedModuleForLecon(mod.id); setLeconDrawerOpen(true); }} icon={Icon.plus}>Leçon</BtnNeutral>
                  <button onClick={() => { setQuizModule(mod); setDrawerQuiz(true); }}
                    className="action-btn"
                    style={{ padding: "7px 12px", borderRadius: 7, border: `1px solid ${C.accent}`,
                      background: C.accentPale, color: C.accent, fontSize: 12, fontWeight: 600,
                      cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                      display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = C.accentMid; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = C.accentPale; }}>
                    {Icon.sparkle} Quiz IA
                  </button>
                  <IconBtn onClick={() => { setEditingModule(mod); setEditMForm({ titre: mod.titre, duree: mod.duree || "" }); setDrawerEditM(true); }}
                    icon={Icon.edit} title="Modifier le module" />
                  <IconBtn onClick={() => supprimerModule(mod)} icon={Icon.trash} danger title="Supprimer le module" />
                </div>
              </div>
              {(mod.lecons || []).length === 0 ? (
                <div style={{ padding: "14px 18px", fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>
                  Aucune leçon pour le moment.
                </div>
              ) : (
                (mod.lecons || []).map((l) => (
                  <div key={l.id}>
                    <div className="lesson-row"
                      style={{ display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 18px", borderBottom: `1px solid ${C.border}`, background: C.surface }}>
                      <TypeBadge type={l.type} />
                      <span style={{ fontSize: 13, color: C.text, flex: 1, fontWeight: 400 }}>{l.titre}</span>
                      {l.type === "video" && l.contenu_texte && (
                        <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4,
                          background: C.border, color: C.textMuted, fontWeight: 600,
                          textTransform: "uppercase", letterSpacing: "0.04em" }}>+Lecture</span>
                      )}
                      {l.duree && <span style={{ fontSize: 11, color: C.textMuted, flexShrink: 0 }}>{l.duree}</span>}
                      <div style={{ display: "flex", gap: 5, flexShrink: 0, alignItems: "center" }}>
                        <button className="action-btn"
                          onClick={() => { setSelectedLecon(l.id); setErreurVideo(null); setVForm({ titre: "", url: "", description: "", duree: "" }); setDrawerV(true); }}
                          title="Ajouter une vidéo"
                          style={{ padding: "4px 9px", borderRadius: 6, fontSize: 11, fontWeight: 500,
                            border: `1px solid ${C.border}`, background: C.surface, color: C.textSub,
                            cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                            fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.opacity="1"; e.currentTarget.style.background = C.bg; e.currentTarget.style.borderColor = C.borderHover; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = C.border; }}>
                          {Icon.video}
                        </button>
                        <IconBtn onClick={() => { setEditingLecon(l); setEditLForm({ titre: l.titre, type: l.type, video_url: l.video_url || "", contenu_texte: l.contenu_texte || "", duree: l.duree || "" }); setDrawerEditL(true); }}
                          icon={Icon.edit} title="Modifier la leçon" />
                        <IconBtn onClick={() => supprimerLecon(l)} icon={Icon.trash} danger title="Supprimer la leçon" />
                      </div>
                    </div>
                    {l.videos && l.videos.map((v) => (
                      <div key={v.id} className="lesson-row"
                        style={{ display: "flex", alignItems: "center", gap: 12,
                          padding: "8px 18px 8px 48px", background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                          background: C.border, color: C.textMuted, textTransform: "uppercase",
                          letterSpacing: "0.05em", flexShrink: 0 }}>Vidéo</span>
                        <span style={{ fontSize: 12, color: C.text, flex: 1 }}>{v.titre}</span>
                        {v.duree && <span style={{ fontSize: 11, color: C.textMuted }}>{v.duree}</span>}
                        <div style={{ display: "flex", gap: 5 }}>
                          <IconBtn onClick={() => { setEditingVideo(v); setEditVForm({ titre: v.titre, url: v.url || "", description: v.description || "", duree: v.duree || "" }); setDrawerEditV(true); }}
                            icon={Icon.edit} title="Modifier" />
                          <IconBtn onClick={() => supprimerVideo(v)} icon={Icon.trash} danger title="Supprimer" />
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          ))
        )}
        <Drawer open={drawerQuiz} onClose={() => setDrawerQuiz(false)} title="Générateur de Quiz IA" width={520}>
          {quizModule && <QuizManager module={quizModule} onClose={() => setDrawerQuiz(false)} />}
        </Drawer>
        <Drawer open={drawerM} onClose={() => setDrawerM(false)} title="Nouveau module">
          <Input label="Titre du module" value={mForm.titre} required onChange={(e) => setMForm({ ...mForm, titre: e.target.value })} />
          <Input label="Durée estimée" value={mForm.duree} placeholder="ex : 2h30" onChange={(e) => setMForm({ ...mForm, duree: e.target.value })} />
          <BtnPrimary onClick={creerModule} disabled={!mForm.titre} icon={Icon.plus}>Créer le module</BtnPrimary>
        </Drawer>
        <LeconFormDrawer open={leconDrawerOpen} onClose={() => setLeconDrawerOpen(false)}
          moduleId={selectedModuleForLecon} onSuccess={() => { if (detail) loadDetail(detail); }} />
        <Drawer open={drawerV} onClose={() => { setDrawerV(false); setErreurVideo(null); }} title="Ajouter une vidéo">
          {erreurVideo && <div style={{ background: C.dangerPale, border: `1px solid ${C.danger}`,
            borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.danger }}>{erreurVideo}</div>}
          <Input label="Titre" value={vForm.titre} required onChange={(e) => setVForm({ ...vForm, titre: e.target.value })} />
          <Input label="URL YouTube" value={vForm.url} required placeholder="https://www.youtube.com/watch?v=..." onChange={(e) => setVForm({ ...vForm, url: e.target.value })} />
          <Input label="Durée" value={vForm.duree} placeholder="ex : 12 min" onChange={(e) => setVForm({ ...vForm, duree: e.target.value })} />
          <Textarea label="Description (optionnel)" value={vForm.description} rows={3} onChange={(e) => setVForm({ ...vForm, description: e.target.value })} />
          {vForm.url && getYoutubeId(vForm.url) && (
            <div style={{ marginBottom: 16, borderRadius: 10, overflow: "hidden", aspectRatio: "16/9" }}>
              <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${getYoutubeId(vForm.url)}`}
                frameBorder="0" allowFullScreen style={{ display: "block" }} />
            </div>
          )}
          <BtnPrimary onClick={ajouterVideo} disabled={!vForm.titre || !vForm.url} icon={Icon.plus}>Ajouter la vidéo</BtnPrimary>
        </Drawer>
        <Drawer open={drawerEditM} onClose={() => setDrawerEditM(false)} title="Modifier le module">
          <Input label="Titre" value={editMForm.titre} required onChange={(e) => setEditMForm({ ...editMForm, titre: e.target.value })} />
          <Input label="Durée" value={editMForm.duree} placeholder="ex : 2h30" onChange={(e) => setEditMForm({ ...editMForm, duree: e.target.value })} />
          <BtnPrimary onClick={modifierModule} disabled={!editMForm.titre} icon={Icon.save}>Enregistrer</BtnPrimary>
        </Drawer>
        <Drawer open={drawerEditL} onClose={() => setDrawerEditL(false)} title="Modifier la leçon">
          <>
            <Input label="Titre de la leçon" value={editLForm.titre} required onChange={(e) => setEditLForm({ ...editLForm, titre: e.target.value })} />
            <Select label="Type" value={editLForm.type} onChange={(e) => setEditLForm({ ...editLForm, type: e.target.value })}
              options={[{ value: "video", label: "Vidéo" }, { value: "texte", label: "Texte / Lecture" }, { value: "quiz", label: "Quiz" }]} />
            <Input label="Durée" value={editLForm.duree} placeholder="ex : 15 min" onChange={(e) => setEditLForm({ ...editLForm, duree: e.target.value })} />
            {editLForm.type === "video" && (
              <Input label="URL YouTube" value={editLForm.video_url} placeholder="https://www.youtube.com/watch?v=..."
                onChange={(e) => setEditLForm({ ...editLForm, video_url: e.target.value })} />
            )}
            {(editLForm.type === "video" || editLForm.type === "texte") && (
              <Textarea label={editLForm.type === "video" ? "Contenu texte (optionnel)" : "Contenu texte"}
                value={editLForm.contenu_texte} rows={5} placeholder="Notes, description, ressources…"
                onChange={(e) => setEditLForm({ ...editLForm, contenu_texte: e.target.value })} />
            )}
          </>
          <BtnPrimary onClick={modifierLecon} disabled={!editLForm.titre} icon={Icon.save}>Enregistrer</BtnPrimary>
        </Drawer>
        <Drawer open={drawerEditV} onClose={() => setDrawerEditV(false)} title="Modifier la vidéo">
          <Input label="Titre" value={editVForm.titre} required onChange={(e) => setEditVForm({ ...editVForm, titre: e.target.value })} />
          <Input label="URL YouTube" value={editVForm.url} required placeholder="https://…" onChange={(e) => setEditVForm({ ...editVForm, url: e.target.value })} />
          <Input label="Durée" value={editVForm.duree} onChange={(e) => setEditVForm({ ...editVForm, duree: e.target.value })} />
          <Textarea label="Description" value={editVForm.description} rows={3} onChange={(e) => setEditVForm({ ...editVForm, description: e.target.value })} />
          {editVForm.url && getYoutubeId(editVForm.url) && (
            <div style={{ marginBottom: 16, borderRadius: 10, overflow: "hidden", aspectRatio: "16/9" }}>
              <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${getYoutubeId(editVForm.url)}`}
                frameBorder="0" allowFullScreen style={{ display: "block" }} />
            </div>
          )}
          <BtnPrimary onClick={modifierVideo} disabled={!editVForm.titre || !editVForm.url} icon={Icon.save}>Enregistrer</BtnPrimary>
        </Drawer>
        <ConfirmModal open={confirmDel.open} message={confirmDel.message}
          onConfirm={confirmDel.onConfirm} onCancel={() => setConfirmDel({ open: false })} />
      </div>
    );
  }

  return (
    <div>
      <SectionTitle>
        Formations
        <BtnPrimary onClick={() => setDrawerF(true)} icon={Icon.plus}>Nouvelle formation</BtnPrimary>
      </SectionTitle>
      <Table loading={loading}
        cols={[
          { key: "titre", label: "Titre", render: (v, row) => (
            <button onClick={() => loadDetail(row)}
              style={{ background: "none", border: "none", color: C.accent, fontSize: 13,
                fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                padding: 0, textAlign: "left", display: "flex", alignItems: "center", gap: 5,
                transition: "gap 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.gap = "9px"}
              onMouseLeave={(e) => e.currentTarget.style.gap = "5px"}>
              {v} {Icon.arrow}
            </button>
          )},
          { key: "niveau", label: "Niveau", render: (v) => (
            <span style={{ fontSize: 11, color: C.textMuted, background: C.border,
              padding: "2px 8px", borderRadius: 4, fontWeight: 500 }}>{v}</span>
          )},
          { key: "domaine",     label: "Domaine",  render: (v) => <span style={{ fontSize: 12, color: C.textMuted }}>{v || "—"}</span> },
          { key: "created_at",  label: "Créé le",  render: (v) => <span style={{ fontSize: 12, color: C.textMuted }}>{fmtDate(v)}</span> },
          { key: "id", label: "Actions", render: (_, row) => (
            <div style={{ display: "flex", gap: 6 }}>
              <IconBtn onClick={() => supprimerFormation(row)} icon={Icon.trash} danger title="Supprimer" />
            </div>
          )},
        ]}
        data={formations} empty="Aucune formation" />
      <Drawer open={drawerF} onClose={() => setDrawerF(false)} title="Nouvelle formation">
        <Input label="Titre" value={fForm.titre} required onChange={(e) => setFForm({ ...fForm, titre: e.target.value })} />
        <Textarea label="Description" value={fForm.description} rows={3} required onChange={(e) => setFForm({ ...fForm, description: e.target.value })} />
        <Select label="Domaine" value={fForm.domaine} required onChange={(e) => setFForm({ ...fForm, domaine: e.target.value })}
          options={DOMAINES_LIST.map((d) => ({ value: d.id, label: d.titre }))} />
        <Select label="Niveau" value={fForm.niveau} required onChange={(e) => setFForm({ ...fForm, niveau: e.target.value })}
          options={["Débutant", "Intermédiaire", "Avancé", "Expert"].map((n) => ({ value: n, label: n }))} />
        <BtnPrimary onClick={creerFormation} disabled={!fForm.titre || !fForm.description} icon={Icon.plus}>Créer la formation</BtnPrimary>
      </Drawer>
      <ConfirmModal open={confirmDel.open} message={confirmDel.message}
        onConfirm={confirmDel.onConfirm} onCancel={() => setConfirmDel({ open: false })} />
    </div>
  );
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// SECTION STATS
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function SectionStats() {
  const [users, setUsers] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const h = getHeaders();
    Promise.all([
      api.get(`/admin/users`, { headers: h }).catch(() => ({ data: MOCK.users })),
      api.get(`/formations`,  { headers: h }).catch(() => ({ data: MOCK.formations })),
    ]).then(([u, f]) => {
      setUsers(u.data); setFormations(f.data);
      setTimeout(() => setAnimated(true), 100);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const roles = ADMIN_ROLE_OPTIONS;
  const roleCounts = roles.map((r) => ({ role: r, count: users.filter((u) => u.role === r).length }));
  const maxRole = Math.max(...roleCounts.map((r) => r.count), 1);
  const niveaux = ["Débutant", "Intermédiaire", "Avancé", "Expert"];
  const niveauCounts = niveaux.map((n) => ({ niveau: n, count: formations.filter((f) => f.niveau === n).length }));
  const maxNiveau = Math.max(...niveauCounts.map((n) => n.count), 1);

  const Bar = ({ label, value, max, delay = 0 }) => {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
      <div style={{ marginBottom: 14, animation: `fadeUp 0.35s ease ${delay}ms both` }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: C.textSub }}>{label}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{value}</span>
        </div>
        <div style={{ background: C.border, borderRadius: 4, height: 6, overflow: "hidden" }}>
          <div style={{ width: animated ? `${pct}%` : "0%", height: "100%",
            background: C.accent, borderRadius: 4,
            transition: `width 0.8s cubic-bezier(.22,1,.36,1) ${delay}ms` }} />
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 28,
        fontFamily: "'Playfair Display', Georgia, serif", animation: "fadeUp 0.3s ease both" }}>
        Statistiques
      </h1>
      <div style={{ display: "flex", gap: 14, marginBottom: 30, flexWrap: "wrap" }}>
        <KpiCard label="Utilisatrices" value={fmt(users.length)} delay={0} tone="rose" />
        <KpiCard label="Formations" value={fmt(formations.length)} delay={80} tone="green" />
        <KpiCard label="Progression moy." value="68%" delay={160} tone="gold" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {[
          { title: "Répartition des rôles",   data: roleCounts.map((r) => ({ label: ROLE_CFG[r.role]?.label || r.role, value: r.count, max: maxRole })) },
          { title: "Formations par niveau",   data: niveauCounts.map((n) => ({ label: n.niveau, value: n.count, max: maxNiveau })) },
        ].map((card, ci) => (
          <div key={ci} style={{ background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "20px", animation: `fadeUp 0.35s ease ${ci * 80}ms both`,
            transition: "box-shadow 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,0,0,0.06)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = ""}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: "0 0 18px",
              paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>{card.title}</h3>
            {card.data.map((d, i) => <Bar key={i} {...d} delay={i * 70} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK = {
  users: [
    { id: 1, nom: "Aminata Diallo", email: "aminata@shetech.bj", role: "apprenante", niveau: "Débutant",      date_creation: "2024-11-01" },
    { id: 2, nom: "Fatou Koné",     email: "fatou@shetech.bj",   role: "mentor",     niveau: "Expert",        date_creation: "2024-10-15" },
    { id: 3, nom: "Laure Agbossou", email: "laure@shetech.bj",   role: "apprenante", niveau: "Intermédiaire", date_creation: "2024-12-03" },
    { id: 4, nom: "Inès Hounsou",   email: "ines@shetech.bj",    role: "mentor",     niveau: "Avancé",        date_creation: "2024-09-20" },
    { id: 5, nom: "Mariama Balde",  email: "mariama@shetech.bj", role: "apprenante", niveau: "Débutant",      date_creation: "2025-01-08" },
  ],
  formations: [
    { id: 1, titre: "Introduction au Développement Web", niveau: "Débutant",      domaine: "developpement", created_at: "2024-10-01" },
    { id: 2, titre: "Marketing Digital Avancé",          niveau: "Avancé",        domaine: "marketing",     created_at: "2024-11-10" },
    { id: 3, titre: "Intelligence Artificielle & IA",    niveau: "Intermédiaire", domaine: "ia",            created_at: "2024-12-05" },
    { id: 4, titre: "E-commerce & Boutique en ligne",    niveau: "Débutant",      domaine: "ecommerce",     created_at: "2025-01-15" },
  ],
  modules: [
    { id: 1, titre: "Introduction & Fondamentaux", duree: "1h30", lecons: [
      { id: 1, titre: "Bienvenue dans la formation", type: "video", duree: "8 min" },
      { id: 2, titre: "Les concepts essentiels",     type: "texte", duree: "15 min" },
    ]},
  ],
};

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// COMPOSANT PRINCIPAL
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [section, setSection] = useState("dashboard");

  useEffect(() => { injectStyles(); }, []);

  const adminNom = (() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return "Admin";
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.nom || "Admin";
    } catch { return "Admin"; }
  })();

  const renderSection = () => {
    switch (section) {
      case "dashboard":  return <SectionDashboard />;
      case "users":      return <SectionUsers />;
      case "formations": return <SectionFormations />;
      case "stats":      return <SectionStats />;
      default:           return <SectionDashboard />;
    }
  };

  return (
    <div className="admin-shell" style={{ display: "flex", height: "100vh",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      background: "radial-gradient(circle at 88% 10%, rgba(196,92,122,0.13), transparent 28%), radial-gradient(circle at 12% 92%, rgba(232,165,84,0.12), transparent 24%), linear-gradient(135deg, #FFF9FB 0%, #F8F2F5 52%, #FBFCF7 100%)",
      overflow: "hidden" }}>

      <div style={{ width: 252, flexShrink: 0,
        background: "linear-gradient(180deg, #2B1B24 0%, #432437 100%)",
        display: "flex", flexDirection: "column",
        boxShadow: "24px 0 58px rgba(43,27,36,0.18)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%",
          right: -90, top: 28, background: "rgba(196,92,122,0.2)", animation: "adminGlow 5s ease-in-out infinite" }} />
        <div style={{ padding: "26px 22px 22px", borderBottom: "1px solid rgba(255,255,255,0.08)", position: "relative" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#fff",
            fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.3px" }}>
            She<span style={{ color: C.accent }}>Tech</span>
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 6,
            textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 600 }}>
            Administration
          </div>
        </div>

        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto", position: "relative" }}>
          {NAV_ITEMS.map((item, i) => {
            const active = section === item.id;
            return (
              <button key={item.id} onClick={() => setSection(item.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 13px", borderRadius: 8, border: "1px solid transparent", cursor: "pointer",
                  marginBottom: 2, fontFamily: "'DM Sans', sans-serif",
                  background: active ? "rgba(255,255,255,0.13)" : "transparent",
                  borderLeft: `3px solid ${active ? C.accent : "transparent"}`,
                  borderColor: active ? "rgba(255,255,255,0.12)" : "transparent",
                  paddingLeft: active ? 10 : 12, transition: "all 0.15s",
                  animation: `slideRight 0.3s ease ${i * 35}ms both` }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                <span style={{ color: active ? C.accent : C.sidebarText, transition: "color 0.15s", flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: 13, fontWeight: active ? 600 : 400,
                  color: active ? C.sidebarActive : C.sidebarText,
                  transition: "color 0.15s, font-weight 0.15s" }}>
                  {item.label}
                </span>
                {active && (
                  <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%",
                  background: C.accent, boxShadow: "0 0 16px rgba(196,92,122,0.8)", animation: "pulse 2s ease infinite" }} />
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button onClick={() => navigate("/dashboard")}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 8,
              padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              background: "transparent", fontFamily: "'DM Sans', sans-serif",
              color: "rgba(255,255,255,0.2)", fontSize: 12, transition: "color 0.15s" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}>
            {Icon.back} Retour à l'app
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ background: "rgba(255,255,255,0.86)", borderBottom: `1px solid ${C.border}`,
          padding: "0 32px", height: 68, display: "flex", alignItems: "center",
          justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <span style={{ fontSize: 11, color: C.accent, fontWeight: 900,
              textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Console admin
            </span>
            <h1 style={{ margin: "3px 0 0", fontSize: 20, color: C.text,
              fontFamily: "'Playfair Display', Georgia, serif" }}>
              {NAV_ITEMS.find((n) => n.id === section)?.label}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%",
                background: C.accent, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>
                {adminNom.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{adminNom}</span>
            </div>
            <div style={{ width: 1, height: 20, background: C.border }} />
            <button onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}
              style={{ padding: "6px 12px", borderRadius: 7, border: `1px solid ${C.border}`,
                background: "transparent", color: C.textMuted, fontSize: 12,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.style.color = C.text; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMuted; }}>
              {Icon.logout} Déconnexion
            </button>
          </div>
        </div>

        <div key={section} style={{ flex: 1, overflowY: "auto", padding: "32px",
          animation: "fadeUp 0.3s ease both" }}>
          {renderSection()}
        </div>
      </div>
    </div>
  );
}

