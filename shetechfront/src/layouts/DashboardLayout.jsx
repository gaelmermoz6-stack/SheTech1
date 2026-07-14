import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const BASE_MENU = [
  { to: "/dashboard", label: "Tableau de bord", end: true },
  { to: "/dashboard/formations", label: "Formations" },
  { to: "/dashboard/projets", label: "Mes projets" },
  { to: "/dashboard/communaute", label: "Communauté" },
  { to: "/dashboard/certificats", label: "Certificats" },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.nom
    ? user.nom.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "ST";

  const menuItems = [
    ...BASE_MENU,
    ...(user?.role === "admin" ? [{ to: "/admin", label: "Administration" }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <button className="dash-logo" type="button" onClick={() => navigate("/dashboard")}>
          <span>She</span>Tech
        </button>

        <nav className="dash-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "is-active" : undefined)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="dash-user">
          <div>{initials}</div>
          <section>
            <strong>{user?.nom}</strong>
            <span>Niveau {user?.niveau || 1}</span>
          </section>
        </div>
      </aside>

      <main className="dash-main">
        <Outlet />
      </main>
    </div>
  );
}
