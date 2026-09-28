import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiPauseCircle,
  FiPlayCircle,
  FiSearch,
  FiRefreshCw,
  FiTarget,
  FiEye,
  FiCheckCircle,
  FiX
} from "react-icons/fi";
import DashboardLayout from "../../components/DashboardLayout";
import Button from "../../components/Button";
import ProgressBar from "../../components/ProgressBar";
import { useAuth } from "../../context/AuthContext";
import {
  getOrganizationSoloCampaigns,
  getOrganizationSharedCampaigns,
} from "../../services/organizationApi";
import {
  createSoloCampaign,
  createSharedCampaign,
  updateSoloCampaign,
  updateSharedCampaign,
  updateCampaignStatus,
  deleteCampaign,
} from "../../services/campaignApi";
import {   restoreCampaign } from "../../services/adminApi";
import { campaignStatusLabel, campaignStatusValue, normalizeCampaign } from "../../utils/normalize";

const STATUS_FILTERS = [ "نشطة", "مكتملة", "تُحضر", "مؤجلة", "منتهية"];



export default function OrgCampaigns() {
  const { orgId, currentOrg, organizations } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [typeFilter, setTypeFilter] = useState("all");

  // Modal states
  const [modalMode, setModalMode] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [saving, setSaving] = useState(false);
const [showDeleted, setShowDeleted] = useState(false);
  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [campaignType, setCampaignType] = useState("solo");
  const [typeCategory, setTypeCategory] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [selectedPartnerOrgs, setSelectedPartnerOrgs] = useState([]);
  

  const loadCampaigns = async () => {
    
    if (!orgId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [soloRes, sharedRes] = await Promise.allSettled([
        getOrganizationSoloCampaigns(orgId,showDeleted),
        getOrganizationSharedCampaigns(orgId,showDeleted),
      ]);

      const soloList = soloRes.status === "fulfilled" && Array.isArray(soloRes.value) ? soloRes.value : [];
      const sharedList = sharedRes.status === "fulfilled" && Array.isArray(sharedRes.value) ? sharedRes.value : [];

      const all = [
        ...soloList.map((c) => ({ ...c, isSolo: true })),
        ...sharedList.map((c) => ({ ...c, isSolo: false })),
      ]
        .map(normalizeCampaign)
        .filter(Boolean);

      setCampaigns(all);
    } catch (err) {
      console.error("Failed to load campaigns:", err);
      setError("تعذر تحميل الحملات الخاصة بالمنظمة.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [orgId,showDeleted]);

  // Open modal if action=create is passed in query
  useEffect(() => {
    if (searchParams.get("action") === "create") {
      openCreateModal();
      searchParams.delete("action");
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  const openCreateModal = () => {
    setSelectedCampaign(null);
    setTitle("");
    setDescription("");
    setTarget("");
    setCampaignType("solo");
    setTypeCategory(0);
    setDeadline("");
    setSelectedPartnerOrgs([]);
    setModalMode("create");
  };

  const openEditModal = (c) => {
  
    setSelectedCampaign(c);
  
    setTitle(c.title || "");
    setDescription(c.description || "");
    setTarget(String(c.targetMoney || c.target || ""));
    setCampaignType(c.isSolo ? "solo" : "shared");
    setDeadline(c.deadline ? c.deadline.split("T")[0] : "");
    setModalMode("edit");
  };

  const openDetailsModal = (c) => {
    console.log(c);
    setSelectedCampaign(c);
    setModalMode("details");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedCampaign(null);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setError("يرجى إدخال عنوان الحملة.");
      return;
    }
    const numTarget = Number(target);
    if (!numTarget || numTarget <= 0) {
      setError("يرجى إدخال مبلغ مستهدف صحيح أكبر من صفر.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (modalMode === "create") {
        if (campaignType === "solo") {
          await createSoloCampaign({
            title: title.trim(),
            description: description.trim(),
            target: numTarget,
            type: typeCategory,
            organizationId: Number(orgId),
            deadline: deadline ? new Date(deadline).toISOString() : null,
            isSolo:true,

          });
        } else {
          const partnerIds = Array.from(new Set([Number(orgId), ...selectedPartnerOrgs]));
          await createSharedCampaign({
            title: title.trim(),
            description: description.trim(),
            target: numTarget,
            type: typeCategory,
            creatorOrganizationId: Number(orgId),
            organizationIds: partnerIds,
            deadline: deadline ? new Date(deadline).toISOString() : null,
            isSolo:false,
          });
        }
        setSuccessMsg("تم إنشاء الحملة بنجاح.");
      } else if (modalMode === "edit" && selectedCampaign) {
        const payload = {
          id: selectedCampaign.id,
          title: title.trim(),
          description: description.trim(),
          target: numTarget,
          type: typeCategory,
          deadline: deadline ? new Date(deadline).toISOString() : null,
        };

        if (selectedCampaign.isSolo) {
          await updateSoloCampaign(selectedCampaign.id, {
            ...payload,
            organizationId: Number(orgId),
          });
        } else {
          await updateSharedCampaign(selectedCampaign.id, {
            ...payload,
            organizationId: Number(orgId),
          });
        }
        setSuccessMsg("تم تحديث بيانات الحملة بنجاح.");
      }

      closeModal();
      await loadCampaigns();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Error saving campaign:", err);
      setError(err?.response?.data?.message || "حدث خطأ أثناء حفظ الحملة.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (c) => {
    const currentStatus = String(c.status || "Active");
    const isCurrentlyActive = currentStatus.toLowerCase() === "active" || currentStatus === "نشطة";
    const nextStatus = isCurrentlyActive ? "Postponed" : "Active";

    try {
      await updateCampaignStatus(c.id, nextStatus);
      setSuccessMsg(`تم تحديث حالة الحملة إلى ${isCurrentlyActive ? "مؤجلة" : "نشطة"}.`);
      await loadCampaigns();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Status update error:", err);
      setError("تعذر تغيير حالة الحملة.");
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`هل أنت متأكد من حذف حملة "${c.title}"؟`)) return;

    try {
      await deleteCampaign(c.id);
      setSuccessMsg("تم حذف الحملة بنجاح.");
      await loadCampaigns();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Delete campaign error:", err);
      setError("تعذر حذف الحملة.");
    }
  };

  const filteredCampaigns = useMemo(() => {

    return campaigns.filter((c) => {
      const matchSearch = (c.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(search.toLowerCase());
      console.log(c);
      const label = campaignStatusLabel(c.status);
      const matchStatus = statusFilter === "الكل" || label === statusFilter;

      const matchType =
        typeFilter === "all" ||
        (typeFilter === "solo" && c.isSolo) ||
        (typeFilter === "shared" && !c.isSolo);

      return matchSearch && matchStatus && matchType;
    });
  }, [campaigns, search, statusFilter, typeFilter]);

  return (
    <DashboardLayout role="org">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--heading-text)" }}>
            إدارة الحملات الخيرية
          </h1>
          <p style={{ fontSize: "0.8rem", color: "var(--muted-text)", marginTop: 3 }}>
            منظمة: {currentOrg?.name || "منظمتك"} ({campaigns.length} حملة مسجلة)
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn--outline btn--sm"
            onClick={loadCampaigns}
            title="تحديث القائمة"
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <FiRefreshCw size={13} className={loading ? "spin" : ""} />
            تحديث
          </button>

          <Button
            size="sm"
            onClick={openCreateModal}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <FiPlus size={13} /> حملة جديدة
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert--success" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: 6 }}>
          <FiCheckCircle size={15} /> {successMsg}
        </div>
      )}

      {error && (
        <div className="alert alert--error" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}
<div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.25rem" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
          <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} />
          عرض الحملات المحذوفة
        </label>
      </div>
      {/* Search & Filter Bar */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 220 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن حملة بالعنوان أو الوصف..."
          />
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

        {/* Status filter tabs */}
        <div className="tabs" style={{ marginBottom: 0, border: "none" }}>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              className={`tab${statusFilter === s ? " tab--active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Table & Cards */}
      <div className="card">
        {/* Desktop Table View */}
        <div className="table-desktop-view" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>عنوان الحملة</th>
                <th>النوع</th>
                <th>الحالة</th>
                <th>المبلغ المجموع / المستهدف</th>
                <th>نسبة الإنجاز</th>
                <th>الموعد النهائي</th>
                <th style={{ textAlign: "center" }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }} className="muted">
                    جاري تحميل الحملات...
                  </td>
                </tr>
              ) : filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem" }} className="muted">
                    <FiTarget size={30} style={{ opacity: 0.3, marginBottom: 8, display: "block", margin: "0 auto" }} />
                    لا توجد حملات تطابق معايير البحث الحالية.
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((c) => {
                  const collected = Number(c.collectedMoney) || 0;
                  const targetVal = Number(c.targetMoney) || 1;
                  const isSolo = c.isSolo;
                  const label = campaignStatusLabel(c.status);
                  const isActive = String(c.status).toLowerCase() === "active" || label === "نشطة";
                  const deleted = Boolean(c.deleted || c.isDeleted);
                  const status = c.status || c.campaignStatus || "-";
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, maxWidth: 220 }}>
                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={c.title}>
                          {c.title}
                        </div>
                      </td>

                      <td>
                        <span className={`badge ${isSolo ? "badge--gray" : "badge--blue"}`}>
                          {isSolo ? "فردية" : "مشتركة"}
                        </span>
                      </td>

                      <td>
                        <span className={`badge ${isActive ? "badge--green" : "badge--gray"}`}>
                          {label}
                        </span>
                      </td>

                      <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                        <strong style={{ color: "var(--brand-green)" }}>
                          {collected.toLocaleString("ar-EG")}
                        </strong>
                        <span className="muted"> / {targetVal.toLocaleString("ar-EG")} ج.م</span>
                      </td>

                      <td style={{ minWidth: 130 }}>
                        <ProgressBar value={collected} max={targetVal} label />
                      </td>

                      <td className="muted" style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                        {c.deadline ? new Date(c.deadline).toLocaleDateString("ar-EG") : "غير محدد"}
                      </td>

                      <td>
                        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                          {/* View details */}
                          <button
                            className="btn btn--ghost btn--sm"
                            style={{ padding: "4px 7px" }}
                            title="عرض التفاصيل"
                            onClick={() => openDetailsModal(c)}
                          >
                            <FiEye size={13} />
                          </button>

                          {/* Edit */}
                          <button
                            className="btn btn--ghost btn--sm"
                            style={{ padding: "4px 7px" }}
                            title="تعديل الحملة"
                            onClick={() => openEditModal(c)}
                          >
                            <FiEdit2 size={13} />
                          </button>

                          {/* Pause / Resume */}
                          <button
                            className="btn btn--ghost btn--sm"
                            style={{ padding: "4px 7px", color: isActive ? "var(--error)" : "var(--brand-green)" }}
                            title={isActive ? "إيقاف مؤقت" : "تفعيل الحملة"}
                            onClick={() => handleToggleStatus(c)}
                          >
                            {isActive ? <FiPauseCircle size={14} /> : <FiPlayCircle size={14} />}
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
                                                   
                                                  </>
                                                )}
                          {/* Delete */}
                          <button
                            className="btn btn--ghost btn--sm"
                            style={{ padding: "4px 7px", color: "var(--error)" }}
                            title="حذف الحملة"
                            onClick={() => handleDelete(c)}
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View with prominent actions */}
        <div className="cards-mobile-view">
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }} className="muted">
              جاري تحميل الحملات...
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem" }} className="muted">
              <FiTarget size={30} style={{ opacity: 0.3, marginBottom: 8, display: "block", margin: "0 auto" }} />
              لا توجد حملات تطابق معايير البحث الحالية.
            </div>
          ) : (
            filteredCampaigns.map((c) => {
              const collected = Number(c.collectedMoney) || 0;
              const targetVal = Number(c.targetMoney) || 1;
              const isSolo = c.isSolo;
              const label = campaignStatusLabel(c.status);
              const isActive = String(c.status).toLowerCase() === "active" || label === "نشطة";
              const deleted = Boolean(c.deleted || c.isDeleted);
              const status = c.status || c.campaignStatus || "-";

              return (
                <div key={c.id} className="mobile-table-card">
                  <div className="mobile-table-card__header">
                    <div className="mobile-table-card__title">{c.title}</div>
                    <div className="mobile-table-card__badges">
                      <span className={`badge ${isSolo ? "badge--gray" : "badge--blue"}`}>
                        {isSolo ? "فردية" : "مشتركة"}
                      </span>
                      <span className={`badge ${isActive ? "badge--green" : "badge--gray"}`}>
                        {label}
                      </span>
                    </div>
                  </div>

                  <div className="mobile-table-card__grid">
                    <div>
                      <div className="mobile-table-card__field-label">المجموع</div>
                      <div className="mobile-table-card__field-val" style={{ color: "var(--brand-green)" }}>
                        {collected.toLocaleString("ar-EG")} ج.م
                      </div>
                    </div>
                    <div>
                      <div className="mobile-table-card__field-label">المستهدف</div>
                      <div className="mobile-table-card__field-val">
                        {targetVal.toLocaleString("ar-EG")} ج.م
                      </div>
                    </div>
                    <div>
                      <div className="mobile-table-card__field-label">الموعد النهائي</div>
                      <div className="mobile-table-card__field-val" style={{ fontSize: "0.75rem" }}>
                        {c.deadline ? new Date(c.deadline).toLocaleDateString("ar-EG") : "غير محدد"}
                      </div>
                    </div>
                    <div>
                      <div className="mobile-table-card__field-label">المعرف</div>
                      <div className="mobile-table-card__field-val">#{c.id}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 2 }}>
                    <ProgressBar value={collected} max={targetVal} label />
                  </div>

                  {/* Actions Bar */}
                  <div className="mobile-table-card__actions">
                    <button
                      className="btn btn--outline btn--sm"
                      onClick={() => openDetailsModal(c)}
                    >
                      <FiEye size={13} /> تفاصيل
                    </button>

                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => openEditModal(c)}
                    >
                      <FiEdit2 size={13} /> تعديل
                    </button>

                    <button
                      className="btn btn--ghost btn--sm"
                      style={{ color: isActive ? "var(--error)" : "var(--brand-green)" }}
                      onClick={() => handleToggleStatus(c)}
                    >
                      {isActive ? <><FiPauseCircle size={14} /> إيقاف</> : <><FiPlayCircle size={14} /> تفعيل</>}
                    </button>

                    {deleted ? (
                      <button
                        className="btn btn--outline btn--sm"
                        onClick={async () => { try { await restoreCampaign(c.id); await loadCampaigns(); } catch { setError("تعذر استعادة الحملة."); } }}
                      >
                        <FiRefreshCw size={12} /> استعادة
                      </button>
                    ) : (
                      <select
                        className="field-select"
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
                    )}

                    <button
                      className="btn btn--ghost btn--sm"
                      style={{ color: "var(--error)" }}
                      onClick={() => handleDelete(c)}
                    >
                      <FiTrash2 size={13} /> حذف
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(modalMode === "create" || modalMode === "edit") && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal__header">
              <h3 className="modal__title">
                {modalMode === "create" ? "إنشاء حملة خيرية جديدة" : "تعديل بيانات الحملة"}
              </h3>
              <button
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-text)" }}
                onClick={closeModal}
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div className="form-group">
                <label className="field-label">عنوان الحملة *</label>
                <input
                  className="field-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: مساعدة الأسر المتضررة"
                  required
                />
              </div>

              {modalMode === "create" && (
                <div className="form-group">
                  <label className="field-label">نوع الحملة</label>
                  <select
                    className="field-select"
                    value={campaignType}
                    onChange={(e) => setCampaignType(e.target.value )}
                  >
                    <option value="solo">فردية (خاصة بهذه المنظمة فقط)</option>
                    <option value="shared">مشتركة (بالتعاون مع منظمات أخرى)</option>
                  </select>
                </div>
              )}

              {modalMode === "create" && campaignType === "shared" && (
                <div className="form-group">
                  <label className="field-label">المنظمات الشريكة في الحملة</label>
                  <div style={{ maxHeight: 120, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 6, padding: 8 }}>
                    {organizations
                      .filter((o) => String(o.id) !== String(orgId))
                      .map((o) => {
                        const checked = selectedPartnerOrgs.includes(o.id);
                        return (
                          <label key={o.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", padding: "3px 0", cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPartnerOrgs([...selectedPartnerOrgs, o.id]);
                                } else {
                                  setSelectedPartnerOrgs(selectedPartnerOrgs.filter((id) => id !== o.id));
                                }
                              }}
                            />
                            {o.name}
                          </label>
                        );
                      })}
                  </div>
                  <span className="muted" style={{ fontSize: "0.72rem" }}>
                    يتم إدراج منظمتك كمنشئ الحملة تلقائياً.
                  </span>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div className="form-group">
                  <label className="field-label">المبلغ المستهدف (ج.م) *</label>
                  <input
                    className="field-input"
                    type="number"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="مثال: 50000"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="field-label">الموعد النهائي</label>
                  <input
                    className="field-input"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="field-label">تصنيف الحملة</label>
                <select
                  className="field-select"
                  value={typeCategory}
                  onChange={(e) => setTypeCategory(Number(e.target.value))}
                >
                  <option value={0}>إغاثة عاجلة / مساعدات عامة</option>
                  <option value={1}>دعم أيتام وأرامل</option>
                  <option value={2}>رعاية صحية وعلاج</option>
                  <option value={3}>تعليم وتدريب</option>
                  <option value={4}>توفير طعام ومياه</option>
                  <option value={5}>إعمار وإسكان</option>
                </select>
              </div>

              <div className="form-group">
                <label className="field-label">تفاصيل ووصف الحملة</label>
                <textarea
                  className="field-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="أدخل وصفاً مفصلاً لأهداف الحملة والفئات المستهدفة..."
                  rows={3}
                />
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" className="btn btn--ghost btn--sm" onClick={closeModal}>
                  إلغاء
                </button>
                <Button isLoading={saving} size="sm" type="submit">
                  {modalMode === "create" ? "إنشاء الحملة" : "حفظ التغييرات"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {modalMode === "details" && selectedCampaign && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal__header">
              <h3 className="modal__title">تفاصيل الحملة</h3>
              <button
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-text)" }}
                onClick={closeModal}
              >
                <FiX size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", fontSize: "0.85rem" }}>
              <div>
                <strong>عنوان الحملة:</strong> {selectedCampaign.title}
              </div>

              {selectedCampaign.description && (
                <div>
                  <strong>الوصف:</strong>
                  <p style={{ marginTop: 4, color: "var(--muted-text)", lineHeight: 1.5, background: "var(--bg-soft)", padding: 8, borderRadius: 6 }}>
                    {selectedCampaign.description}
                  </p>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <strong>النوع:</strong>{" "}
                  <span className={`badge ${selectedCampaign.isSolo ? "badge--gray" : "badge--blue"}`}>
                    {selectedCampaign.isSolo ? "فردية" : "مشتركة"}
                  </span>
                </div>
                <div>
                  <strong>الحالة:</strong>{" "}
                  <span className="badge badge--green">
                    {campaignStatusLabel(selectedCampaign.status)}
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <strong>المبلغ المستهدف:</strong>{" "}
                  {Number(selectedCampaign.targetMoney || selectedCampaign.target || 0).toLocaleString("ar-EG")} ج.م
                </div>
                <div>
                  <strong>المجموع حتى الآن:</strong>{" "}
                  {Number(selectedCampaign.collectedMoney || 0).toLocaleString("ar-EG")} ج.م
                </div>
              </div>

              <div>
                <div style={{ marginBottom: 4 }}><strong>نسبة الإنجاز:</strong></div>
                <ProgressBar
                  value={Number(selectedCampaign.collectedMoney) || 0}
                  max={Number(selectedCampaign.targetMoney) || 1}
                  label
                />
              </div>

              <div>
                <strong>الموعد النهائي:</strong>{" "}
                {selectedCampaign.deadline
                  ? new Date(selectedCampaign.deadline).toLocaleDateString("ar-EG")
                  : "غير محدد"}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button className="btn btn--outline btn--sm" onClick={closeModal}>
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
