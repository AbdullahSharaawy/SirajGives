import { FiDollarSign, FiTrendingUp } from "react-icons/fi";
import DashboardLayout from "../../components/DashboardLayout";

const DONATIONS = [
  { id: 1, donor: "أحمد محمد", campaign: "مساعدة الأسر المتضررة", amount: 500, date: "2024-01-20", status: "مكتمل" },
  { id: 2, donor: "فاطمة علي", campaign: "توزيع ملابس الشتاء", amount: 250, date: "2024-01-19", status: "مكتمل" },
  { id: 3, donor: "محمد عبد الله", campaign: "دعم أرامل وأيتام الشهداء", amount: 1000, date: "2024-01-18", status: "مكتمل" },
  { id: 4, donor: "متبرع مجهول", campaign: "مساعدة الأسر المتضررة", amount: 100, date: "2024-01-17", status: "مكتمل" },
  { id: 5, donor: "سارة إبراهيم", campaign: "توزيع ملابس الشتاء", amount: 750, date: "2024-01-16", status: "مكتمل" },
];

const TOTALS = [
  { campaign: "مساعدة الأسر المتضررة", total: 85000, donors: 148 },
  { campaign: "توزيع ملابس الشتاء", total: 42000, donors: 92 },
  { campaign: "دعم أرامل وأيتام الشهداء", total: 55000, donors: 102 },
];

export default function OrgDonations() {
  return (
    <DashboardLayout role="org">
      <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--heading-text)", marginBottom: "1.25rem" }}>التبرعات</h1>

      {/* Campaign totals */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {TOTALS.map((t) => (
          <div key={t.campaign} className="card" style={{ padding: "1rem" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--muted-text)", fontWeight: 700, marginBottom: 4 }}>{t.campaign}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <FiDollarSign size={16} color="var(--brand-green)" />
              <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--heading-text)" }}>{t.total.toLocaleString("ar-EG")}</span>
              <span style={{ fontSize: "0.72rem", color: "var(--muted-text)" }}>ج.م</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--muted-text)", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
              <FiTrendingUp size={11} /> {t.donors} متبرع
            </div>
          </div>
        ))}
      </div>

      {/* Transactions table */}
      <div className="card">
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: "0.88rem" }}>
          آخر التبرعات
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>المتبرع</th>
                <th>الحملة</th>
                <th>المبلغ</th>
                <th>التاريخ</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {DONATIONS.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{d.donor}</td>
                  <td className="muted">{d.campaign}</td>
                  <td style={{ color: "var(--brand-green)", fontWeight: 700 }}>{d.amount.toLocaleString("ar-EG")} ج.م</td>
                  <td className="muted">{d.date}</td>
                  <td><span className="badge badge--green">{d.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
