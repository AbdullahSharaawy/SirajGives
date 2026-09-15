import { FiTarget, FiPackage, FiDollarSign, FiUsers, FiTrendingUp, FiAlertCircle } from "react-icons/fi";
import DashboardLayout from "../../components/DashboardLayout";
import ProgressBar from "../../components/ProgressBar";

const STATS = [
  { label: "حملات نشطة", value: "7", icon: <FiTarget />, color: "#e8f5e9", iconColor: "#3f8747" },
  { label: "إجمالي التبرعات", value: "845,200", unit: "ج.م", icon: <FiDollarSign />, color: "#fef9ec", iconColor: "#c9a570" },
  { label: "أصناف عينية", value: "34", icon: <FiPackage />, color: "#e8f0fe", iconColor: "#3b6ac3" },
  { label: "متبرعون", value: "1,240", icon: <FiUsers />, color: "#fdecea", iconColor: "#b3413f" },
];

const RECENT_CAMPAIGNS = [
  { id: 1, title: "مساعدة الأسر المتضررة", collected: 85000, target: 120000, daysLeft: 14 },
  { id: 2, title: "توزيع ملابس الشتاء", collected: 42000, target: 50000, daysLeft: 7 },
  { id: 6, title: "دعم أرامل وأيتام الشهداء", collected: 55000, target: 150000, daysLeft: 45 },
];

export default function OrgDashboard() {
  return (
    <DashboardLayout role="org">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--heading-text)" }}>لوحة التحكم</h1>
          <p style={{ fontSize: "0.78rem", color: "var(--muted-text)", marginTop: 2 }}>جمعية الرحمة — آخر تحديث: اليوم</p>
        </div>
        <div className="badge badge--green"><FiTrendingUp size={10} /> نشطة</div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {STATS.map((s) => (
          <div key={s.label} className="stat-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div className="stat-card__label">{s.label}</div>
              <div className="stat-card__icon" style={{ background: s.color, color: s.iconColor }}>{s.icon}</div>
            </div>
            <div className="stat-card__value">{s.value}</div>
            {s.unit && <div className="stat-card__sub">{s.unit}</div>}
          </div>
        ))}
      </div>

      {/* Campaigns overview */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1rem" }}>
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 className="section-title">أداء الحملات</h2>
            <button className="btn btn--outline btn--sm">إدارة الحملات</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {RECENT_CAMPAIGNS.map((c) => (
              <div key={c.id} style={{ padding: "0.85rem", background: "var(--bg-soft)", borderRadius: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: "0.82rem" }}>{c.title}</span>
                  <span style={{ fontSize: "0.68rem", color: c.daysLeft <= 10 ? "var(--error)" : "var(--muted-text)", display: "flex", alignItems: "center", gap: 3 }}>
                    {c.daysLeft <= 10 && <FiAlertCircle size={10} />} {c.daysLeft} يوم
                  </span>
                </div>
                <ProgressBar value={c.collected} max={c.target} label />
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card" style={{ padding: "1.1rem" }}>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--heading-text)", marginBottom: "0.85rem" }}>إجراءات سريعة</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {["إنشاء حملة جديدة", "إضافة صنف عيني", "عرض التبرعات"].map((a) => (
                <button key={a} className="btn btn--ghost btn--sm" style={{ textAlign: "right", justifyContent: "flex-start" }}>{a}</button>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: "1.1rem" }}>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--heading-text)", marginBottom: "0.85rem" }}>حالة الدفع</div>
            <span className="badge badge--green" style={{ fontSize: "0.75rem" }}>Paymob مفعّل ✓</span>
            <p style={{ fontSize: "0.72rem", color: "var(--muted-text)", marginTop: 6, lineHeight: 1.5 }}>
              بوابة الدفع نشطة ومربوطة بحساب Paymob الخاص بمنظمتك.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
