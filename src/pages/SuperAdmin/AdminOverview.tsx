import { useEffect, useState } from "react";
import { FiUsers, FiTarget, FiBriefcase, FiDollarSign, FiAlertTriangle, FiTrendingUp } from "react-icons/fi";
import DashboardLayout from "../../components/DashboardLayout";
import { getAdminOverview } from "../../services/adminApi";

export default function AdminOverview() {
  const [overview, setOverview] = useState<any>({ users: 0, campaigns: {}, organizations: 0, donations: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { getAdminOverview().then(setOverview).catch(() => setError("تعذر تحميل ملخص المنصة.")).finally(() => setLoading(false)); }, []);

  const campaignStats = overview.campaigns || {};
  const stats = [
    { label: "إجمالي المستخدمين", value: overview.users, icon: <FiUsers />, color: "#e8f0fe", iconColor: "#3b6ac3", delta: "من API المستخدمين" },
    { label: "الحملات النشطة", value: campaignStats.activeCount ?? campaignStats.activeCampaigns ?? "-", icon: <FiTarget />, color: "#e8f5e9", iconColor: "#3f8747", delta: "من إحصاءات الحملات" },
    { label: "المنظمات المسجلة", value: overview.organizations?.count ?? overview.organizations, icon: <FiBriefcase />, color: "#fef9ec", iconColor: "#c9a570", delta: "من API المنظمات" },
    { label: "إجمالي التبرعات", value: Number(overview.donations?.amount ?? overview.donations ?? 0).toLocaleString("ar-EG"), icon: <FiDollarSign />, color: "#fdecea", iconColor: "#b3413f", delta: "ج.م من API التبرعات" },
  ];
  return (
    <DashboardLayout role="admin">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--heading-text)" }}>لوحة التحكم العليا</h1>
          <p style={{ fontSize: "0.78rem", color: "var(--muted-text)", marginTop: 2 }}>SuperAdmin — نظرة عامة على المنصة</p>
        </div>
        <div className="badge badge--blue">بيانات مباشرة من API</div>
      </div>
      {error ? <div className="alert alert--error">{error}</div> : null}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div className="stat-card__label">{s.label}</div>
              <div className="stat-card__icon" style={{ background: s.color, color: s.iconColor }}>{s.icon}</div>
            </div>
            <div className="stat-card__value">{loading ? "..." : s.value}</div>
            <div className="stat-card__sub" style={{ display: "flex", alignItems: "center", gap: 3, color: "var(--brand-green)" }}>
              <FiTrendingUp size={10} /> {s.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Activity feed */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1rem" }}>
        <div className="card" style={{ padding: "1.25rem" }}>
          <h2 className="section-title" style={{ marginBottom: "1rem" }}>آخر الأحداث</h2>
          <div className="alert alert--info">لا توجد واجهة نشاط عامة موثقة في API حالياً.</div>
        </div>

        <div className="card" style={{ padding: "1.1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: "0.82rem", color: "var(--muted-text)", marginBottom: 6 }}>
            <FiAlertTriangle size={13} /> تنبيه
          </div>
          <p style={{ fontSize: "0.72rem", color: "var(--muted-text)", lineHeight: 1.6 }}>
            راجع صفحات الإدارة التفصيلية لتنفيذ العمليات المدعومة من API.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
