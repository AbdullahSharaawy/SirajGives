import { useEffect, useState } from "react";
import { FiRefreshCw, FiTrash2, FiSearch, FiZap } from "react-icons/fi";
import DashboardLayout from "../../components/DashboardLayout";
import Button from "../../components/Button";
import ProgressBar from "../../components/ProgressBar";
import { autoExpireCampaigns, deleteCampaign, deleteExpiredCampaigns, getCampaigns, restoreCampaign, updateCampaignStatus } from "../../services/adminApi";
import { campaignStatusLabel, campaignStatusValue, normalizeCampaign } from "../../utils/normalize";

const STATUSES = ["الكل", "نشطة", "منتهية", "محذوفة"];

export default function AdminCampaigns() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [running, setRunning] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCampaigns = async () => {
    setLoading(true);
    try { setCampaigns((await getCampaigns()).map(normalizeCampaign).filter(Boolean)); } catch { setError("تعذر تحميل الحملات."); } finally { setLoading(false); }
  };

  useEffect(() => { loadCampaigns(); }, []);

  const filtered = campaigns.filter((c) => {
    const haystack = `${c.title || ""} ${c.organizationName || ""}`.toLowerCase();
    const ms = haystack.includes(search.toLowerCase());
    if (statusFilter === "الكل") return ms;
    if (statusFilter === "محذوفة") return ms && c.deleted;
    return ms && !c.deleted && campaignStatusLabel(c.status) === statusFilter;
  });

  const autoExpire = async () => {
    setRunning(true);
    try { await autoExpireCampaigns(); await loadCampaigns(); } catch { setError("تعذر تشغيل الانتهاء التلقائي."); } finally { setRunning(false); }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm("حذف جميع الحملات المنتهية؟")) return;
    try { await deleteExpiredCampaigns(); await loadCampaigns(); } catch { setError("تعذر حذف الحملات المنتهية."); }
  };

  return (
    <DashboardLayout role="admin">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--heading-text)" }}>إدارة الحملات</h1>
        <div style={{ display: "flex", gap: 6 }}>
          <Button size="sm" variant="outline" isLoading={running} onClick={autoExpire} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <FiZap size={12} /> انتهاء تلقائي
          </Button>
          <button
            className="btn btn--danger btn--sm"
            onClick={handleBulkDelete}
          >
            <FiTrash2 size={12} /> حذف المنتهية
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن حملة..." />
          <button><FiSearch size={14} /></button>
        </div>
        <div className="tabs" style={{ marginBottom: 0, border: "none" }}>
          {STATUSES.map((s) => (
            <button key={s} className={`tab${statusFilter === s ? " tab--active" : ""}`} onClick={() => setStatusFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="card">
        {error ? <div className="alert alert--error">{error}</div> : null}
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>الحملة</th>
                <th>المنظمة</th>
                <th>الحالة</th>
                <th>التقدم</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5}>جار تحميل الحملات...</td></tr> : null}
              {!loading && filtered.length === 0 ? <tr><td colSpan={5}>لا توجد حملات.</td></tr> : null}
              {!loading && filtered.map((c) => {
                const title = c.title || c.name || "-";
                const org = c.organizationName || c.organization?.name || c.org || "-";
                const status = c.status || c.campaignStatus || "-";
                const deleted = Boolean(c.deleted || c.isDeleted);
                const collected = c.collected ?? c.totalRaised ?? c.currentAmount ?? 0;
                const target = c.target ?? c.targetAmount ?? 0;
                return (
                <tr key={c.id} style={{ opacity: c.deleted ? 0.5 : 1 }}>
                  <td style={{ fontWeight: 600 }}>{title}</td>
                  <td className="muted">{org}</td>
                  <td>
                    <span className={`badge ${deleted ? "badge--red" : "badge--green"}`}>
                      {deleted ? "محذوفة" : status}
                    </span>
                  </td>
                  <td style={{ minWidth: 140 }}><ProgressBar value={collected} max={target} label /></td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      {deleted ? (
                        <button className="btn btn--outline btn--sm" style={{ display: "flex", alignItems: "center", gap: 4 }} onClick={async () => { try { await restoreCampaign(c.id); await loadCampaigns(); } catch { setError("تعذر استعادة الحملة."); } }}>
                          <FiRefreshCw size={11} /> استعادة
                        </button>
                      ) : (
                        <>
                          <select
                            className="field-select"
                            style={{ padding: "3px 6px", width: 100, fontSize: "0.72rem" }}
                            defaultValue={status}
                            onChange={async (e) => { try { await updateCampaignStatus(c.id, campaignStatusValue(e.target.value)); await loadCampaigns(); } catch { setError("تعذر تحديث حالة الحملة."); } }}
                          >
                            <option>نشطة</option>
                            <option>منتهية</option>
                            <option>موقوفة</option>
                          </select>
                          <button className="btn btn--ghost btn--sm" style={{ padding: "4px 8px", color: "var(--error)" }} onClick={async () => { try { await deleteCampaign(c.id); await loadCampaigns(); } catch { setError("تعذر حذف الحملة."); } }}>
                            <FiTrash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
