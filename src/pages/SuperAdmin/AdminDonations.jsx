import { useEffect, useState } from "react";
import { FiAlertTriangle, FiBarChart2, FiTrendingUp, FiUsers } from "react-icons/fi";
import DashboardLayout from "../../components/DashboardLayout";
import { getDonationStats } from "../../services/adminApi";

export default function AdminDonations() {
  const [stats, setStats] = useState({ amount: 0, count: 0, donors: [], campaigns: [], trend: [], suspicious: [] });
  const [error, setError] = useState("");

  useEffect(() => { getDonationStats().then(setStats).catch(() => setError("تعذر تحميل تحليلات التبرعات.")); }, []);
  const max = Math.max(...stats.trend.map((m) => Number(m.amount || m.total || m.value || 0)), 1);
  return (
    <DashboardLayout role="admin">
      <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--heading-text)", marginBottom: "1.5rem" }}>
        تقارير وتحليلات التبرعات
      </h1>
      {error ? <div className="alert alert--error">{error}</div> : null}

      {/* Monthly chart (bar) */}
      <div className="card" style={{ padding: "1.25rem", marginBottom: "1.25rem" }}>
        <h2 className="section-title" style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 6 }}>
          <FiBarChart2 color="var(--accent-green)" size={16} /> التبرعات الشهرية
        </h2>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "1.5rem", height: 140, padding: "0 0.5rem" }}>
          {stats.trend.map((m, index) => {
            const amount = Number(m.amount || m.total || m.value || 0);
            const pct = (amount / max) * 100;
            return (
              <div key={m.month} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
                <span style={{ fontSize: "0.68rem", color: "var(--muted-text)", fontWeight: 700 }}>
                  {(amount / 1000000).toFixed(1)}م
                </span>
                <div style={{ width: "100%", background: "var(--accent-green)", borderRadius: "4px 4px 0 0", height: `${pct}%`, minHeight: 8, transition: "height 0.3s" }} />
                <span style={{ fontSize: "0.68rem", color: "var(--muted-text)" }}>{m.month || m.date || index + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
        {/* Top donors */}
        <div className="card" style={{ padding: "1.1rem" }}>
          <h2 className="section-title" style={{ marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: 6 }}>
            <FiUsers color="var(--accent-green)" size={14} /> أكبر المتبرعين
          </h2>
          {stats.donors.map((d, i) => (
            <div key={d.name || d.userName || i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: i < stats.donors.length - 1 ? "1px solid var(--border-soft)" : "none" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontWeight: 800, fontSize: "0.78rem", color: "var(--muted-text)", width: 18 }}>#{i + 1}</span>
                <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>{d.name || d.userName || "-"}</span>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--brand-green)" }}>{Number(d.total || d.amount || 0).toLocaleString("ar-EG")} ج.م</div>
                <div style={{ fontSize: "0.65rem", color: "var(--muted-text)" }}>{d.count || 0} عملية</div>
              </div>
            </div>
          ))}
        </div>

        {/* Top campaigns */}
        <div className="card" style={{ padding: "1.1rem" }}>
          <h2 className="section-title" style={{ marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: 6 }}>
            <FiTrendingUp color="var(--accent-green)" size={14} /> أعلى الحملات تبرعاً
          </h2>
          {stats.campaigns.map((c, i) => (
            <div key={c.title || c.campaignName || i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: i < stats.campaigns.length - 1 ? "1px solid var(--border-soft)" : "none" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontWeight: 800, fontSize: "0.78rem", color: "var(--muted-text)", width: 18 }}>#{i + 1}</span>
                <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>{c.title || c.campaignName || "-"}</span>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--brand-green)" }}>{(Number(c.total || c.amount || 0) / 1000).toFixed(0)}k ج.م</div>
                <div style={{ fontSize: "0.65rem", color: "var(--muted-text)" }}>{c.donors || c.count || 0} متبرع</div>
              </div>
            </div>
          ))}
        </div>
      </div>

     
    </DashboardLayout>
  );
}
