import { useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiUser, FiLogOut, FiLogIn } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import LogoImage from '../assets/logo.png';
export default function Navbar() {
  const nav = useNavigate();
  const loc = useLocation();
  const { isAuth, user, logout, isSuperAdmin, isOrgAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const links = [
    { label: "الرئيسية", path: "/" },
    { label: "الحملات", path: "/campaigns" },
    { label: "المنظمات", path: "/organizations" },
   
  ];

 const active = (p) =>
    loc.pathname === p ? "navbar__link navbar__link--active" : "navbar__link";

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <div className="navbar__logo" onClick={() => nav(isOrgAdmin && !isSuperAdmin ? "/org-admin" : "/")}>
          <img src={LogoImage} alt="Siraj Logo" style={{ height: "100px" }} />
        </div>

        {/* Links */}
        <div className="navbar__links">
          {links.map((l) => (
            <span
              key={l.path}
              className={active(l.path)}
              onClick={() => {
                if (l.path === "/" && isOrgAdmin && !isSuperAdmin) {
                  nav("/org-admin");
                } else {
                  nav(l.path);
                }
              }}
            >
              {l.label}
            </span>
          ))}
          {(isOrgAdmin || isSuperAdmin) && (
            <span className={active("/org-admin")} onClick={() => nav("/org-admin")}>
              لوحة المنظمة
            </span>
          )}
          {isSuperAdmin && (
            <span className={active("/admin")} onClick={() => nav("/admin")}>
              الإدارة العليا
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="navbar__actions">
          {isAuth ? (
            <>
              <span
                className="navbar__link"
                style={{ display: "flex", alignItems: "center", gap: 4 }}
                onClick={() => nav("/profile")}
              >
                <FiUser size={15} />
                {user?.name?.split(" ")[0]}
              </span>
              <button
                onClick={() => { logout(); nav("/"); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-text)", display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem" }}
              >
                <FiLogOut size={14} />
              </button>
            </>
          ) : (
            <button
              className="btn btn--primary btn--sm"
              onClick={() => nav("/login")}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <FiLogIn size={13} />
              تسجيل الدخول
            </button>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: "none", background: "none", border: "none", cursor: "pointer" }}
            className="mobile-menu-btn"
          >
            <FiMenu size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
