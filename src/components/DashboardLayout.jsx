import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { FiHome, FiTarget, FiSettings, FiDollarSign, FiUsers, FiBarChart2, FiBriefcase } from "react-icons/fi";

export default function DashboardLayout({ children, role }) {
  const nav = useNavigate();
  const loc = useLocation();

  const orgItems = [
    { label: "لوحة التحكم", path: "/org-admin", icon: <FiHome size={15} /> },
    { label: "إدارة الحملات", path: "/org-admin/campaigns", icon: <FiTarget size={15} />, section: "الحملات" },
    { label: "التبرعات", path: "/org-admin/donations", icon: <FiDollarSign size={15} />, section: "المالية" },
    { label: "إعدادات المنظمة", path: "/org-admin/settings", icon: <FiSettings size={15} />, section: "الإعدادات" },
  ];

  const adminItems = [
    { label: "نظرة عامة", path: "/admin", icon: <FiHome size={15} /> },
    { label: "المستخدمون", path: "/admin/users", icon: <FiUsers size={15} />, section: "الإدارة" },
    { label: "الحملات", path: "/admin/campaigns", icon: <FiTarget size={15} /> },
    { label: "المنظمات", path: "/admin/organizations", icon: <FiBriefcase size={15} /> },
    { label: "تقارير التبرعات", path: "/admin/donations", icon: <FiBarChart2 size={15} />, section: "التحليلات" },
  ];

  const items = role === "org" ? orgItems : adminItems;
  let lastSection = "";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      {/* Mobile Horizontal Sub-Navigation for Dashboard */}
      <nav className="dashboard-mobile-nav" aria-label="تنقل لوحة التحكم السريع">
        {items.map((item) => {
          const isActive = loc.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`dashboard-mobile-nav__item ${isActive ? "dashboard-mobile-nav__item--active" : ""}`}
              onClick={() => nav(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="dashboard-shell">
        <aside className="sidebar">
          {items.map((item) => {
            const showSection = item.section && item.section !== lastSection;
            if (item.section) lastSection = item.section;
            const isActive = loc.pathname === item.path;
            return (
              <div key={item.path}>
                {showSection && <div className="sidebar__section">{item.section}</div>}
                <div
                  className={`sidebar__item${isActive ? " sidebar__item--active" : ""}`}
                  onClick={() => nav(item.path)}
                  role="button"
                  tabIndex={0}
                >
                  {item.icon}
                  {item.label}
                </div>
              </div>
            );
          })}
        </aside>
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
