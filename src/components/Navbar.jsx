import { useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiUser, FiLogOut, FiLogIn, FiHome, FiTarget, FiBriefcase, FiShield } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import LogoImage from '../assets/logo.png';

export default function Navbar() {
  const nav = useNavigate();
  const loc = useLocation();
  const { isAuth, user, logout, isSuperAdmin, isOrgAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const [prevPath, setPrevPath] = useState(loc.pathname);
  if (loc.pathname !== prevPath) {
    setPrevPath(loc.pathname);
    setMenuOpen(false);
  }

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    if (menuOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const links = [
    { label: "الرئيسية", path: "/", icon: <FiHome size={16} /> },
    { label: "الحملات", path: "/campaigns", icon: <FiTarget size={16} /> },
    { label: "المنظمات", path: "/organizations", icon: <FiBriefcase size={16} /> },
  ];

  const active = (p) =>
    loc.pathname === p ? "navbar__link navbar__link--active" : "navbar__link";

  const mobileActive = (p) =>
    loc.pathname === p
      ? "navbar__mobile-link navbar__mobile-link--active"
      : "navbar__mobile-link";

  const handleNavigate = (path) => {
    setMenuOpen(false);
    nav(path);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar__inner">
          {/* Logo */}
          <div className="navbar__logo" onClick={() => nav("/")} role="button" tabIndex={0}>
            <img src={LogoImage} alt="Siraj Logo" className="navbar__logo-img" />
          </div>

          {/* Desktop Links */}
          <div className="navbar__links">
            {links.map((l) => (
              <span
                key={l.path}
                className={active(l.path)}
                onClick={() => nav(l.path)}
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
            {/* Desktop Auth Section */}
            <div className="navbar__desktop-auth">
              {isAuth ? (
                <>
                  <span
                    className="navbar__link"
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                    onClick={() => nav("/profile")}
                  >
                    <FiUser size={15} />
                    {user?.name?.split(" ")[0]}
                  </span>
                  <button
                    onClick={() => { logout(); nav("/"); }}
                    className="navbar__logout-btn"
                    title="تسجيل الخروج"
                    aria-label="تسجيل الخروج"
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
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة الرئيسية"}
              aria-expanded={menuOpen}
              className="mobile-menu-btn"
            >
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div
          className="navbar__mobile-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`navbar__mobile-drawer ${menuOpen ? "navbar__mobile-drawer--open" : ""}`}
        aria-label="القائمة الجانبية للتنقل"
      >
        <div className="navbar__mobile-header">
          <div className="navbar__logo" onClick={() => handleNavigate("/")}>
            <img src={LogoImage} alt="Siraj Logo" style={{ height: "42px", objectFit: "contain" }} />
          </div>
          <button
            className="navbar__mobile-close-btn"
            onClick={() => setMenuOpen(false)}
            aria-label="إغلاق القائمة"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* User Card if Authenticated */}
        {isAuth && (
          <div className="navbar__mobile-user-card" onClick={() => handleNavigate("/profile")}>
            <div className="navbar__mobile-user-avatar">
              <FiUser size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="navbar__mobile-user-name">{user?.name || "مستخدم"}</div>
              <div className="navbar__mobile-user-role">
                {isSuperAdmin ? "مسؤول النظام" : isOrgAdmin ? "مسؤول منظمة" : "متبرع"}
              </div>
            </div>
          </div>
        )}

        {/* Links */}
        <div className="navbar__mobile-nav">
          <div className="navbar__mobile-section-title">التنقل</div>
          {links.map((l) => (
            <button
              key={l.path}
              className={mobileActive(l.path)}
              onClick={() => handleNavigate(l.path)}
            >
              <span className="navbar__mobile-link-icon">{l.icon}</span>
              <span className="navbar__mobile-link-text">{l.label}</span>
            </button>
          ))}

          {(isOrgAdmin || isSuperAdmin) && (
            <>
              <div className="navbar__mobile-section-title" style={{ marginTop: "1rem" }}>الإدارة</div>
              <button
                className={mobileActive("/org-admin")}
                onClick={() => handleNavigate("/org-admin")}
              >
                <span className="navbar__mobile-link-icon"><FiShield size={16} /></span>
                <span className="navbar__mobile-link-text">لوحة المنظمة</span>
              </button>
            </>
          )}

          {isSuperAdmin && (
            <button
              className={mobileActive("/admin")}
              onClick={() => handleNavigate("/admin")}
            >
              <span className="navbar__mobile-link-icon"><FiShield size={16} /></span>
              <span className="navbar__mobile-link-text">الإدارة العليا</span>
            </button>
          )}

          {isAuth && (
            <>
              <div className="navbar__mobile-section-title" style={{ marginTop: "1rem" }}>الحساب</div>
              <button
                className={mobileActive("/profile")}
                onClick={() => handleNavigate("/profile")}
              >
                <span className="navbar__mobile-link-icon"><FiUser size={16} /></span>
                <span className="navbar__mobile-link-text">الملف الشخصي والتبرعات</span>
              </button>
            </>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="navbar__mobile-footer">
          {isAuth ? (
            <button
              className="btn btn--outline btn--danger btn--full"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0.65rem 1rem" }}
              onClick={() => {
                setMenuOpen(false);
                logout();
                nav("/");
              }}
            >
              <FiLogOut size={16} />
              تسجيل الخروج
            </button>
          ) : (
            <button
              className="btn btn--primary btn--full"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0.65rem 1rem" }}
              onClick={() => handleNavigate("/login")}
            >
              <FiLogIn size={16} />
              تسجيل الدخول
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
