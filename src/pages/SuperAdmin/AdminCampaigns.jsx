import { useEffect, useState } from "react";
import { FiRefreshCw, FiTrash2, FiSearch, FiZap,FiEye } from "react-icons/fi";
import DashboardLayout from "../../components/DashboardLayout";
import ProgressBar from "../../components/ProgressBar";
import {  deleteCampaign,  getCampaigns,getDeletedCampaigns, restoreCampaign, updateCampaignStatus } from "../../services/adminApi";
import { campaignStatusLabel, campaignStatusValue, normalizeCampaign } from "../../utils/normalize";

const STATUSES = ["الكل","تُحضر","نشطة","مؤجلة", "مكتملة","منتهية","مستبعدة"];

export default function AdminCampaigns() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [campaigns, setCampaigns] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailsCampaign, setDetailsCampaign] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
 const loadCampaigns = async () => {
    setLoading(true);
    try { 
      // Fetch deleted or active conditionally via API
      const data = showDeleted ? await getDeletedCampaigns() : await getCampaigns(false);
      setCampaigns(data.map(normalizeCampaign).filter(Boolean)); 
    } catch { 
      setError("تعذر تحميل الحملات."); 
    } finally { 
      setLoading(false); 
    }
  };

  // Depend on showDeleted so it refetches when toggled
  useEffect(() => { loadCampaigns(); }, [showDeleted]);

const openDetailsModal = async (campaign) => {
  setDetailsLoading(true);
  setDetailsCampaign({ ...campaign });
   setDetailsLoading(false);
 
};

const closeDetailsModal = () => setDetailsCampaign(null);

  useEffect(() => { loadCampaigns(); }, []);

 const filtered = campaigns.filter((c) => {
    const haystack = `${c.title || ""} ${c.organizationName || ""}`.toLowerCase();
    const ms = haystack.includes(search.toLowerCase());
    
    const matchType =
      typeFilter === "all" ||
      (typeFilter === "solo" && c.isSolo) ||
      (typeFilter === "shared" && !c.isSolo);

    if (statusFilter === "الكل") return ms && matchType;
    return ms && matchType && campaignStatusLabel(c.status) === statusFilter; 
  });

  

  return (
    <DashboardLayout role="admin">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--heading-text)" }}>إدارة الحملات</h1>
        <div style={{ display: "flex", gap: 6 }}>
         
        </div>
      </div>
<div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.25rem" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
          <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} />
          عرض الحملات المحذوفة
        </label>
      </div>
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن حملة..." />
          <button><FiSearch size={14} /></button>
        </div>
         {/* Type filter buttons */}
        <div style={{ display: "flex", gap: 4, background: "var(--bg-soft)", padding: 3, borderRadius: 8 }}>
          <button
            className={`btn btn--sm ${typeFilter === "all" ? "btn--primary" : "btn--ghost"}`}
            style={{ fontSize: "0.75rem", padding: "4px 10px" }}
            onClick={() => setTypeFilter("all")}
          >
            الكل
          </button>
          <button
            className={`btn btn--sm ${typeFilter === "solo" ? "btn--primary" : "btn--ghost"}`}
            style={{ fontSize: "0.75rem", padding: "4px 10px" }}
            onClick={() => setTypeFilter("solo")}
          >
            فردية
          </button>
          <button
            className={`btn btn--sm ${typeFilter === "shared" ? "btn--primary" : "btn--ghost"}`}
            style={{ fontSize: "0.75rem", padding: "4px 10px" }}
            onClick={() => setTypeFilter("shared")}
          >
            مشتركة
          </button>
        </div>
        <div className="tabs" style={{ marginBottom: 0, border: "none", overflowX: "auto", maxWidth: "100%" }}>
          {STATUSES.map((s) => (
            <button key={s} className={`tab${statusFilter === s ? " tab--active" : ""}`} onClick={() => setStatusFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="card">
        {error ? <div className="alert alert--error">{error}</div> : null}
        
        {/* Desktop Table View */}
        <div className="table-desktop-view">
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>الحملة</th>
                  <th>المنظمة</th>
                  <th>الحالة</th>
                  <th>التقدم</th>
                  <th style={{ textAlign: "center" }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>جار تحميل الحملات...</td></tr> : null}
                {!loading && filtered.length === 0 ? <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>لا توجد حملات.</td></tr> : null}
                {!loading && filtered.map((c) => {
                  const title = c.title ||  "-";
                  const org = Array.isArray(c.organizationNames) && c.organizationNames.length > 1 
                    ? c.organizationNames.join("، ") 
                    : (c.organizationName || "-");
                  const status = c.status || c.campaignStatus || "-";
                  const deleted = Boolean(c.deleted || c.isDeleted);
                  const collected = c.collected ?? c.totalRaised ?? c.currentAmount ?? 0;
                  const target = c.target ?? c.targetAmount ?? 0;
                  return (
                  <tr key={c.id} style={{ opacity: c.deleted ? 0.5 : 1 }}>
                    <td style={{ fontWeight: 600 }}>{title}</td>
                    <td className="muted" style={{ maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={org}>{org}</td>
                    <td>
                      <span className={`badge ${deleted ? "badge--red" : "badge--green"}`}>
                        {deleted ? "محذوفة" : status}
                      </span>
                    </td>
                    <td style={{ minWidth: 140 }}><ProgressBar value={collected} max={target} label /></td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                        <button
                          className="btn btn--ghost btn--sm"
                          style={{ padding: "4px 8px" }}
                          onClick={() => openDetailsModal(c)}
                          aria-label={`عرض تفاصيل ${title}`}
                          title="عرض التفاصيل"
                        >
                          <FiEye size={12} />
                        </button>
                        {deleted ? (
                          <button className="btn btn--outline btn--sm" style={{ display: "flex", alignItems: "center", gap: 4 }} onClick={async () => { try { await restoreCampaign(c.id); await loadCampaigns(); } catch { setError("تعذر استعادة الحملة."); } }}>
                            <FiRefreshCw size={11} /> استعادة
                          </button>
                        ) : (
                          <>
                            <select
                              className="field-select"
                              style={{ padding: "3px 6px", width: 100, fontSize: "0.72rem" }}
                              value={campaignStatusLabel(status)}
                              onChange={async (e) => { try { await updateCampaignStatus(c.id, campaignStatusValue(e.target.value)); await loadCampaigns(); } catch { setError("تعذر تحديث حالة الحملة."); } }}
                            >
                              <option>تُحضر</option>
                              <option>نشطة</option>
                              <option>مكتملة</option>
                              <option>مستبعدة</option>
                              <option>مؤجلة</option>
                              <option>منتهية</option>
                            </select>
                            <button className="btn btn--ghost btn--sm" style={{ padding: "4px 8px", color: "var(--error)" }} title="حذف الحملة" onClick={async () => { try { await deleteCampaign(c.id); await loadCampaigns(); } catch { setError("تعذر حذف الحملة."); } }}>
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

        {/* Mobile Cards View */}
        <div className="cards-mobile-view">
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }} className="muted">
              جار تحميل الحملات...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem" }} className="muted">
              لا توجد حملات مطابقة للبحث أو الفلتر.
            </div>
          ) : (
            filtered.map((c) => {
              const title = c.title || "-";
              const org = Array.isArray(c.organizationNames) && c.organizationNames.length > 1
                ? c.organizationNames.join("، ")
                : (c.organizationName || "-");
              const status = c.status || c.campaignStatus || "-";
              const deleted = Boolean(c.deleted || c.isDeleted);
              const collected = c.collected ?? c.totalRaised ?? c.currentAmount ?? 0;
              const target = c.target ?? c.targetAmount ?? 0;
              const isSolo = c.isSolo;

              return (
                <div key={c.id} className="mobile-table-card" style={{ opacity: deleted ? 0.65 : 1 }}>
                  <div className="mobile-table-card__header">
                    <div className="mobile-table-card__title">{title}</div>
                    <div className="mobile-table-card__badges">
                      <span className={`badge ${isSolo ? "badge--gray" : "badge--blue"}`}>
                        {isSolo ? "فردية" : "مشتركة"}
                      </span>
                      <span className={`badge ${deleted ? "badge--red" : "badge--green"}`}>
                        {deleted ? "محذوفة" : status}
                      </span>
                    </div>
                  </div>

                  <div className="mobile-table-card__grid">
                    <div>
                      <div className="mobile-table-card__field-label">المنظمة</div>
                      <div className="mobile-table-card__field-val" style={{ fontSize: "0.8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={org}>
                        {org}
                      </div>
                    </div>
                    <div>
                      <div className="mobile-table-card__field-label">المعرف</div>
                      <div className="mobile-table-card__field-val">#{c.id}</div>
                    </div>
                    <div>
                      <div className="mobile-table-card__field-label">المجموع</div>
                      <div className="mobile-table-card__field-val" style={{ color: "var(--brand-green)" }}>
                        {collected.toLocaleString("ar-EG")} ج.م
                      </div>
                    </div>
                    <div>
                      <div className="mobile-table-card__field-label">المستهدف</div>
                      <div className="mobile-table-card__field-val">
                        {target.toLocaleString("ar-EG")} ج.م
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 4 }}>
                    <ProgressBar value={collected} max={target} label />
                  </div>

                  {/* Actions Bar */}
                  <div className="mobile-table-card__actions">
                    <button
                      className="btn btn--outline btn--sm"
                      onClick={() => openDetailsModal(c)}
                    >
                      <FiEye size={13} /> تفاصيل
                    </button>

                    {deleted ? (
                      <button
                        className="btn btn--outline btn--sm"
                        onClick={async () => {
                          try {
                            await restoreCampaign(c.id);
                            await loadCampaigns();
                          } catch {
                            setError("تعذر استعادة الحملة.");
                          }
                        }}
                      >
                        <FiRefreshCw size={12} /> استعادة
                      </button>
                    ) : (
                      <>
                        <select
                          className="field-select"
                          value={campaignStatusLabel(status)}
                          onChange={async (e) => {
                            try {
                              await updateCampaignStatus(c.id, campaignStatusValue(e.target.value));
                              await loadCampaigns();
                            } catch {
                              setError("تعذر تحديث حالة الحملة.");
                            }
                          }}
                        >
                          <option>تُحضر</option>
                          <option>نشطة</option>
                          <option>مكتملة</option>
                          <option>مستبعدة</option>
                          <option>مؤجلة</option>
                          <option>منتهية</option>
                        </select>

                        <button
                          className="btn btn--ghost btn--sm"
                          style={{ color: "var(--error)" }}
                          onClick={async () => {
                            try {
                              await deleteCampaign(c.id);
                              await loadCampaigns();
                            } catch {
                              setError("تعذر حذف الحملة.");
                            }
                          }}
                        >
                          <FiTrash2 size={13} /> حذف
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {detailsCampaign && (
  <div className="modal-backdrop" onClick={closeDetailsModal}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal__header">
        <h3 className="modal__title">تفاصيل الحملة</h3>
        <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={closeDetailsModal}>✕</button>
      </div>

      {detailsLoading ? (
        <div className="muted">جار تحميل التفاصيل...</div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          <div><strong>عنوان الحملة:</strong> {detailsCampaign.title || "-"}</div>
          <div><strong>الوصف:</strong> {detailsCampaign.description || "-"}</div>
          <div>
            <strong>المنظمة:</strong>{" "}
            {Array.isArray(detailsCampaign.organizationNames) && detailsCampaign.organizationNames.length > 1
              ? detailsCampaign.organizationNames.join("، ")
              : (detailsCampaign.organizationName || "-")}
          </div>
          <div>
            <strong>الحالة:</strong>{" "}
            <span className={`badge ${detailsCampaign.deleted ? "badge--red" : "badge--green"}`}>
              {detailsCampaign.deleted ? "محذوفة" : (detailsCampaign.status || detailsCampaign.campaignStatus || "-")}
            </span>
          </div>
          <div>
            <strong>المبلغ المستهدف:</strong>{" "}
            {(detailsCampaign.target ?? detailsCampaign.targetAmount ?? 0).toLocaleString()} ر.س
          </div>
          <div>
            <strong>المبلغ المجموع:</strong>{" "}
            {(detailsCampaign.collected ?? detailsCampaign.totalRaised ?? detailsCampaign.currentAmount ?? 0).toLocaleString()} ر.س
          </div>
          <div>
            <strong>نسبة الإنجاز:</strong>
            <div style={{ marginTop: 4 }}>
              <ProgressBar
                value={detailsCampaign.collected ?? detailsCampaign.totalRaised ?? detailsCampaign.currentAmount ?? 0}
                max={detailsCampaign.target ?? detailsCampaign.targetAmount ?? 0}
                label
              />
            </div>
          </div>
          <div><strong>تاريخ الانتهاء / الموعد النهائي:</strong> {detailsCampaign.deadline ?new Date(detailsCampaign.deadline).toLocaleDateString("ar-EG")  : "-"}</div>
          <div><strong>تاريخ الإنشاء:</strong> { detailsCampaign.registrationDate ?new Date(detailsCampaign.registrationDate).toLocaleDateString("ar-EG")  : "-"}</div>
        </div>
      )}
    </div>
  </div>
)}
    </DashboardLayout>
  );
}
