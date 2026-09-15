import { useEffect, useState } from "react";
import { FiPackage, FiAlertCircle } from "react-icons/fi";
import DashboardLayout from "../../components/DashboardLayout";
import { deleteOldItems, getItemStats } from "../../services/adminApi";

export default function AdminItems() {
  const [stats, setStats] = useState<any>({ count: 0, available: 0, distribution: [], donors: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getItemStats().then(setStats).catch(() => setError("تعذر تحميل إحصاءات العطاء العيني.")).finally(() => setLoading(false));
  }, []);

  const distribution = stats.distribution.map((item: any) => ({
    name: item.category || item.name || "-",
    count: item.count || item.total || 0,
    pct: item.percentage || 0,
  }));

  const total = Number(stats.count?.count ?? stats.count ?? 0);
  const available = Number(stats.available?.count ?? stats.available ?? 0);

  return (
    <DashboardLayout role="admin">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--heading-text)" }}>إشراف على العطاء العيني</h1>
        <div className="alert alert--warning" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FiAlertCircle size={13} /> بعض الشاشات تعتمد على {" "}
          <code style={{ fontSize: "0.7rem", background: "rgba(0,0,0,0.06)", padding: "1px 4px", borderRadius: 3 }}>
            [NonController]
          </code>
          {" "} — معلّقة حتى إصلاح الـ backend
        </div>
      </div>

      {error ? <div className="alert alert--error">{error}</div> : null}
      {/* Storage stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="stat-card">
          <div className="stat-card__label">إجمالي الأصناف</div>
          <div className="stat-card__value">{loading ? "..." : total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">متاح الآن</div>
          <div className="stat-card__value" style={{ color: "var(--brand-green)" }}>{loading ? "..." : available}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">غير متاح</div>
          <div className="stat-card__value" style={{ color: "var(--error)" }}>{loading ? "..." : Math.max(total - available, 0)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">حجم المرفقات</div>
          <div className="stat-card__value">غير متاح</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* Category distribution */}
        <div className="card" style={{ padding: "1.1rem" }}>
          <h2 className="section-title" style={{ marginBottom: "1rem" }}>توزيع الفئات</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {distribution.map((c: any) => (
              <div key={c.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{c.name}</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--muted-text)" }}>{c.count} صنف ({c.pct}٪)</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar__fill" style={{ width: `${c.pct}%`, background: "var(--brand-gold)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top donors */}
        <div className="card" style={{ padding: "1.1rem" }}>
          <h2 className="section-title" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: 6 }}>
            <FiPackage color="var(--accent-green)" size={14} /> أكبر المتبرعين عيناً
          </h2>
          {stats.donors.map((d: any, i: number) => (
            <div key={d.name || d.donorName || i} style={{ padding: "0.65rem 0", borderBottom: i < stats.donors.length - 1 ? "1px solid var(--border-soft)" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>{d.name || d.donorName || "-"}</span>
                <span className="badge badge--gold">{d.items || d.count || 0} صنف</span>
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted-text)", marginTop: 2 }}>{d.organizationName || d.org || "-"}</div>
            </div>
          ))}
          <div style={{ marginTop: "1rem" }}>
            <button
              className="btn btn--danger btn--sm btn--full"
              onClick={async () => { if (!window.confirm("حذف الأصناف القديمة غير المتاحة؟")) return; try { await deleteOldItems(365); } catch { setError("تعذر حذف الأصناف القديمة."); } }}
            >
              حذف الأصناف القديمة
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
