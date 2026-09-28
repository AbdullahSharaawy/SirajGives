import { useState, useEffect, useMemo } from "react";
import {
  FiDollarSign,
  FiTrendingUp,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiUsers,
  FiHeart,
  FiTrash2,
  FiRotateCcw,
  FiEye,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiPlus,
  FiEdit2
} from "react-icons/fi";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import {
  getOrganizationSoloCampaigns,
  getOrganizationSharedCampaigns,
} from "../../services/organizationApi";
import {
  getDonationsByOrganization,
  createDonation,
  updateDonation,
  deleteDonation,
  restoreDonation,
} from "../../services/donationApi";
import { normalizeCampaign } from "../../utils/normalize";

export default function OrgDonations() {
  const { orgId, currentOrg } = useAuth();

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [campaignsMap, setCampaignsMap] = useState({});
  const [campaignsList, setCampaignsList] = useState([]);
  const [donations, setDonations] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'deleted'

  // Modals
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Add Manual Donation Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addCampaignId, setAddCampaignId] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [addUserId, setAddUserId] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Edit Donation Modal State
  const [editingDonation, setEditingDonation] = useState(null);
  const [editCampaignId, setEditCampaignId] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const loadDonationsData = async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Fetch campaigns for metadata & dropdowns
      const [soloRes, sharedRes, donationsRes] = await Promise.allSettled([
        getOrganizationSoloCampaigns(orgId),
        getOrganizationSharedCampaigns(orgId),
        getDonationsByOrganization(orgId, { includeDeleted: true }),
      ]);

      const soloList = soloRes.status === "fulfilled" && Array.isArray(soloRes.value) ? soloRes.value : [];
      const sharedList = sharedRes.status === "fulfilled" && Array.isArray(sharedRes.value) ? sharedRes.value : [];

      const allCampaigns = [...soloList, ...sharedList]
        .map(normalizeCampaign)
        .filter(Boolean);

      setCampaignsList(allCampaigns);

      const map = {};
      allCampaigns.forEach((c) => {
        map[c.id] = c;
      });
      setCampaignsMap(map);

      // 2. Process donations from backend endpoint
      let rawDonations = [];
      if (donationsRes.status === "fulfilled") {
        const val = donationsRes.value;
        rawDonations = Array.isArray(val) ? val : val?.data ?? [];
      }

      const formatted = rawDonations.map((d) => {
        const camp = d.campaign || map[d.campaignId];
        return {
          id: d.id,
          amount: Number(d.amount) || 0,
          userId: d.userId || "",
          donorName: d.userName || d.userFullName || (d.userId ? `مستخدم #${d.userId.substring(0, 8)}` : "متبرع كريم"),
          campaignId: d.campaignId,
          campaignTitle: camp?.title || `حملة #${d.campaignId}`,
          date: d.registrationDate || d.createdOn || new Date().toISOString(),
          isDeleted: Boolean(d.isDeleted),
          status: d.isDeleted ? "محذوف" : "مكتمل",
        };
      });

      // Sort descending by date
      formatted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setDonations(formatted);
    } catch (err) {
      console.error("Failed to load donations data:", err);
      setError("تعذر تحميل سجل التبرعات. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonationsData();
  }, [orgId]);

  // Handle Manual Donation Creation (without Paymob)
  const handleAddDonation = async (e) => {
    e.preventDefault();
    if (!addCampaignId || !addAmount || Number(addAmount) <= 0) {
      setError("يرجى اختيار الحملة وإدخال مبلغ تبرع صحيح أكبر من 0.");
      return;
    }

    setAddLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload = {
        campaignId: Number(addCampaignId),
        amount: Number(addAmount),
        userId: addUserId.trim() ? addUserId.trim() : undefined,
      };

      const res = await createDonation(payload);
      const newDonation = res?.data ?? res;

      const camp = newDonation.campaign || campaignsMap[newDonation.campaignId] || campaignsList.find((c) => c.id === Number(addCampaignId));

      const formatted = {
        id: newDonation.id,
        amount: Number(newDonation.amount) || Number(addAmount),
        userId: newDonation.userId || addUserId || "",
        donorName: newDonation.userName || newDonation.userFullName || (addUserId.trim() ? addUserId.trim() : "تسجيل يدوي"),
        campaignId: newDonation.campaignId || Number(addCampaignId),
        campaignTitle: camp?.title || `حملة #${addCampaignId}`,
        date: newDonation.registrationDate || new Date().toISOString(),
        isDeleted: false,
        status: "مكتمل",
      };

      setDonations((prev) => [formatted, ...prev]);
      setSuccessMsg("تم تسجيل التبرع اليدوي بنجاح وإضافته إلى الحملة.");
      setShowAddModal(false);
      setAddAmount("");
      setAddUserId("");
    } catch (err) {
      console.error("Failed to add manual donation:", err);
      setError(err?.response?.data?.message || "تعذر إضافة التبرع اليدوي.");
    } finally {
      setAddLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (donation) => {
    setEditingDonation(donation);
    setEditCampaignId(donation.campaignId);
    setEditAmount(donation.amount);
    setError("");
  };

  // Handle Update Donation
  const handleUpdateDonation = async (e) => {
    e.preventDefault();
    if (!editCampaignId || !editAmount || Number(editAmount) <= 0) {
      setError("يرجى إدخال مبلغ صحيح واختيار الحملة.");
      return;
    }

    setEditLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload = {
        campaignId: Number(editCampaignId),
        amount: Number(editAmount),
      };

      const res = await updateDonation(editingDonation.id, payload);
      const updated = res?.data ?? res;

      const camp = updated?.campaign || campaignsMap[Number(editCampaignId)] || campaignsList.find((c) => c.id === Number(editCampaignId));

      setDonations((prev) =>
        prev.map((d) =>
          d.id === editingDonation.id
            ? {
                ...d,
                amount: Number(editAmount),
                campaignId: Number(editCampaignId),
                campaignTitle: camp?.title || d.campaignTitle,
              }
            : d
        )
      );

      setSuccessMsg("تم تحديث بيانات التبرع بنجاح.");
      setEditingDonation(null);
    } catch (err) {
      console.error("Failed to update donation:", err);
      setError(err?.response?.data?.message || "تعذر تحديث التبرع.");
    } finally {
      setEditLoading(false);
    }
  };

  // Handle Soft-Delete
  const handleDelete = async (id) => {
    setActionLoadingId(id);
    setError("");
    setSuccessMsg("");
    try {
      await deleteDonation(id);
      setDonations((prev) =>
        prev.map((d) => (d.id === id ? { ...d, isDeleted: true, status: "محذوف" } : d))
      );
      setSuccessMsg("تم حذف سجل التبرع بنجاح.");
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("Failed to delete donation:", err);
      setError(err?.response?.data?.message || "تعذر حذف سجل التبرع.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Restore
  const handleRestore = async (id) => {
    setActionLoadingId(id);
    setError("");
    setSuccessMsg("");
    try {
      await restoreDonation(id);
      setDonations((prev) =>
        prev.map((d) => (d.id === id ? { ...d, isDeleted: false, status: "مكتمل" } : d))
      );
      setSuccessMsg("تمت استعادة سجل التبرع بنجاح.");
    } catch (err) {
      console.error("Failed to restore donation:", err);
      setError(err?.response?.data?.message || "تعذر استعادة سجل التبرع.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      const matchSearch =
        d.donorName.toLowerCase().includes(search.toLowerCase()) ||
        d.campaignTitle.toLowerCase().includes(search.toLowerCase()) ||
        String(d.id).includes(search);

      const matchCampaign =
        campaignFilter === "all" || String(d.campaignId) === campaignFilter;

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !d.isDeleted) ||
        (statusFilter === "deleted" && d.isDeleted);

      return matchSearch && matchCampaign && matchStatus;
    });
  }, [donations, search, campaignFilter, statusFilter]);

  // Totals calculations
  const totalCollected = useMemo(() => {
    return donations
      .filter((d) => !d.isDeleted)
      .reduce((sum, d) => sum + d.amount, 0);
  }, [donations]);

  const uniqueDonorsCount = useMemo(() => {
    const userIds = new Set(
      donations.filter((d) => !d.isDeleted && d.userId).map((d) => d.userId)
    );
    return userIds.size;
  }, [donations]);

  const activeDonationsCount = useMemo(() => {
    return donations.filter((d) => !d.isDeleted).length;
  }, [donations]);

  const deletedDonationsCount = useMemo(() => {
    return donations.filter((d) => d.isDeleted).length;
  }, [donations]);

  return (
    <DashboardLayout role="org">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--heading-text)" }}>
            إدارة وسجل التبرعات المالية
          </h1>
          <p style={{ fontSize: "0.8rem", color: "var(--muted-text)", marginTop: 3 }}>
            منظمة: {currentOrg?.name || "منظمتك"} — إضافة وتعديل وحذف التبرعات يدوياً ومتابعة العمليات
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className="btn btn--primary btn--sm"
            onClick={() => {
              if (campaignsList.length > 0 && !addCampaignId) {
                setAddCampaignId(String(campaignsList[0].id));
              }
              setShowAddModal(true);
            }}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <FiPlus size={14} />
            تسجيل تبرع يدوي
          </button>

          <button
            className="btn btn--outline btn--sm"
            onClick={loadDonationsData}
            title="تحديث البيانات"
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <FiRefreshCw size={13} className={loading ? "spin" : ""} />
            تحديث
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert--error" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
          <FiAlertCircle size={16} />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="alert alert--success" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
          <FiCheckCircle size={16} />
          {successMsg}
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="responsive-stats-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div className="stat-card__label">إجمالي التبرعات النشطة</div>
            <div className="stat-card__icon" style={{ background: "#e8f5e9", color: "#3f8747" }}><FiDollarSign /></div>
          </div>
          <div className="stat-card__value">{loading ? "..." : totalCollected.toLocaleString("ar-EG")}</div>
          <div className="stat-card__sub">جنيه مصري</div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div className="stat-card__label">إجمالي المعاملات النشطة</div>
            <div className="stat-card__icon" style={{ background: "#e8f0fe", color: "#3b6ac3" }}><FiHeart /></div>
          </div>
          <div className="stat-card__value">{loading ? "..." : activeDonationsCount}</div>
          <div className="stat-card__sub">عملية تبرع ناجحة</div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div className="stat-card__label">المتبرعون المساهمون</div>
            <div className="stat-card__icon" style={{ background: "#fdecea", color: "#b3413f" }}><FiUsers /></div>
          </div>
          <div className="stat-card__value">{loading ? "..." : uniqueDonorsCount}</div>
          <div className="stat-card__sub">متبرع مميز</div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div className="stat-card__label">التبرعات المحذوفة</div>
            <div className="stat-card__icon" style={{ background: "#f3f4f6", color: "#6b7280" }}><FiTrash2 /></div>
          </div>
          <div className="stat-card__value">{loading ? "..." : deletedDonationsCount}</div>
          <div className="stat-card__sub">تم إلغاؤها / استبعادها</div>
        </div>
      </div>

      {/* Transactions Table & Filters */}
      <div className="card">
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
            سجل العمليات ({filteredDonations.length})
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            {/* Status Filter */}
            <select
              className="field-select"
              style={{ fontSize: "0.78rem", padding: "4px 8px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">كل الحالات ({donations.length})</option>
              <option value="active">النشطة فقط ({activeDonationsCount})</option>
              <option value="deleted">المحذوفة فقط ({deletedDonationsCount})</option>
            </select>

            {/* Campaign dropdown selector */}
            <select
              className="field-select"
              style={{ fontSize: "0.78rem", padding: "4px 8px" }}
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
            >
              <option value="all">كل الحملات</option>
              {campaignsList.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.title}
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="search-bar" style={{ flex: "1 1 180px", maxWidth: 260, marginBottom: 0 }}>
              <input
                style={{ fontSize: "0.78rem", padding: "4px 8px" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بالمتبرع أو الرقم..."
              />
              <button><FiSearch size={12} /></button>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="table-desktop-view">
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>رقم التبرع</th>
                  <th>المتبرع</th>
                  <th>الحملة</th>
                  <th>المبلغ</th>
                  <th>تاريخ التبرع</th>
                  <th>الحالة</th>
                  <th style={{ textAlign: "center" }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }} className="muted">
                      جاري تحميل التبرعات...
                    </td>
                  </tr>
                ) : filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem" }} className="muted">
                      <FiDollarSign size={28} style={{ opacity: 0.3, marginBottom: 6, display: "block", margin: "0 auto" }} />
                      لا توجد عمليات تبرع مطابقة للبحث أو الفلتر المختار.
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map((d) => (
                    <tr key={d.id} style={{ opacity: d.isDeleted ? 0.65 : 1 }}>
                      <td style={{ fontWeight: 700, fontSize: "0.82rem" }}>#{d.id}</td>
                      <td style={{ fontWeight: 600 }}>{d.donorName}</td>
                      <td className="muted" style={{ maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={d.campaignTitle}>
                        {d.campaignTitle}
                      </td>
                      <td style={{ color: d.isDeleted ? "var(--muted-text)" : "var(--brand-green)", fontWeight: 700 }}>
                        {d.amount.toLocaleString("ar-EG")} ج.م
                      </td>
                      <td className="muted" style={{ fontSize: "0.78rem" }}>
                        {d.date ? new Date(d.date).toLocaleString("ar-EG") : "—"}
                      </td>
                      <td>
                        <span className={`badge ${d.isDeleted ? "badge--gray" : "badge--green"}`}>
                          {d.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                          <button
                            className="btn btn--ghost btn--sm"
                            style={{ padding: "4px 7px" }}
                            title="عرض التفاصيل"
                            onClick={() => setSelectedDonation(d)}
                          >
                            <FiEye size={13} />
                          </button>

                          {!d.isDeleted && (
                            <button
                              className="btn btn--ghost btn--sm"
                              style={{ padding: "4px 7px" }}
                              title="تعديل الحملة"
                              onClick={() => handleOpenEditModal(d)}
                            >
                              <FiEdit2 size={13} />
                            </button>
                          )}

                          {!d.isDeleted ? (
                            <button
                              className="btn btn--ghost btn--sm"
                              style={{ padding: "4px 7px", color: "var(--error)" }}
                              title="حذف الحملة"
                              disabled={actionLoadingId === d.id}
                              onClick={() => setDeleteConfirmId(d.id)}
                            >
                              <FiTrash2 size={13} />
                            </button>
                          ) : (
                            <button
                              className="btn btn--ghost btn--sm"
                              style={{ padding: "4px 7px", color: "#16a34a" }}
                              title="استعادة التبرع"
                              disabled={actionLoadingId === d.id}
                              onClick={() => handleRestore(d.id)}
                            >
                              <FiRotateCcw size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="cards-mobile-view">
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }} className="muted">
              جاري تحميل التبرعات...
            </div>
          ) : filteredDonations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem" }} className="muted">
              <FiDollarSign size={28} style={{ opacity: 0.3, marginBottom: 6, display: "block", margin: "0 auto" }} />
              لا توجد عمليات تبرع مطابقة للبحث أو الفلتر المختار.
            </div>
          ) : (
            filteredDonations.map((d) => (
              <div key={d.id} className="mobile-table-card" style={{ opacity: d.isDeleted ? 0.65 : 1 }}>
                <div className="mobile-table-card__header">
                  <div className="mobile-table-card__title" style={{ fontSize: "0.95rem" }}>
                    {d.donorName}
                  </div>
                  <div className="mobile-table-card__badges">
                    <span className="badge badge--blue" style={{ fontSize: "0.72rem" }}>
                      #{d.id}
                    </span>
                    <span className={`badge ${d.isDeleted ? "badge--gray" : "badge--green"}`}>
                      {d.status}
                    </span>
                  </div>
                </div>

                <div className="mobile-table-card__grid">
                  <div>
                    <div className="mobile-table-card__field-label">المبلغ</div>
                    <div
                      className="mobile-table-card__field-val"
                      style={{ color: d.isDeleted ? "var(--muted-text)" : "var(--brand-green)", fontWeight: 700 }}
                    >
                      {d.amount.toLocaleString("ar-EG")} ج.م
                    </div>
                  </div>
                  <div>
                    <div className="mobile-table-card__field-label">الحملة</div>
                    <div
                      className="mobile-table-card__field-val"
                      style={{ fontSize: "0.78rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140 }}
                      title={d.campaignTitle}
                    >
                      {d.campaignTitle}
                    </div>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <div className="mobile-table-card__field-label">تاريخ التبرع</div>
                    <div className="mobile-table-card__field-val" style={{ fontSize: "0.75rem" }}>
                      {d.date ? new Date(d.date).toLocaleString("ar-EG") : "—"}
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="mobile-table-card__actions">
                  <button
                    className="btn btn--outline btn--sm"
                    onClick={() => setSelectedDonation(d)}
                  >
                    <FiEye size={13} /> تفاصيل
                  </button>

                  {!d.isDeleted && (
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => handleOpenEditModal(d)}
                    >
                      <FiEdit2 size={13} /> تعديل
                    </button>
                  )}

                  {!d.isDeleted ? (
                    <button
                      className="btn btn--ghost btn--sm"
                      style={{ color: "var(--error)" }}
                      disabled={actionLoadingId === d.id}
                      onClick={() => setDeleteConfirmId(d.id)}
                    >
                      <FiTrash2 size={13} /> حذف
                    </button>
                  ) : (
                    <button
                      className="btn btn--ghost btn--sm"
                      style={{ color: "#16a34a" }}
                      disabled={actionLoadingId === d.id}
                      onClick={() => handleRestore(d.id)}
                    >
                      <FiRotateCcw size={13} /> استعادة
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Manual Donation Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal__header">
              <h3 className="modal__title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <FiPlus color="var(--brand-green)" /> تسجيل تبرع يدوي (خارج بوابة الدفع)
              </h3>
              <button
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-text)" }}
                onClick={() => setShowAddModal(false)}
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleAddDonation} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              <div className="form-group">
                <label className="field-label">الحملة الخيرية المرتبطة *</label>
                <select
                  className="field-select"
                  value={addCampaignId}
                  onChange={(e) => setAddCampaignId(e.target.value)}
                  required
                >
                  <option value="">-- اختر الحملة --</option>
                  {campaignsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="field-label">المبلغ المتبرع به (جنيه مصري) *</label>
                <input
                  className="field-input"
                  type="number"
                  min="1"
                  step="any"
                  placeholder="مثال: 500"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="field-label">
                  معرّف أو بريد المتبرع (اختياري)
                </label>
                <input
                  className="field-input"
                  type="text"
                  placeholder="بريد المتبرع أو كوده (يُنسب لك كمسؤول إذا تُرِك فارغاً)"
                  value={addUserId}
                  onChange={(e) => setAddUserId(e.target.value)}
                />
                <span className="muted" style={{ fontSize: "0.74rem", marginTop: 4 }}>
                  إذا كان التبرع نقداً أو عبر تحويل للمقر، يمكنك تركه فارغاً وسيتم التوثيق تلقائياً باسمك كمسؤول للمنظمة.
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: "0.5rem" }}>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => setShowAddModal(false)}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn btn--primary btn--sm"
                  disabled={addLoading}
                >
                  {addLoading ? "جاري الحفظ..." : "حفظ التبرع اليدوي"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Donation Modal */}
      {editingDonation && (
        <div className="modal-backdrop" onClick={() => setEditingDonation(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal__header">
              <h3 className="modal__title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <FiEdit2 color="var(--brand-green)" /> تعديل بيانات التبرع #{editingDonation.id}
              </h3>
              <button
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-text)" }}
                onClick={() => setEditingDonation(null)}
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateDonation} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              <div className="form-group">
                <label className="field-label">الحملة الخيرية *</label>
                <select
                  className="field-select"
                  value={editCampaignId}
                  onChange={(e) => setEditCampaignId(e.target.value)}
                  required
                >
                  {campaignsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="field-label">المبلغ (جنيه مصري) *</label>
                <input
                  className="field-input"
                  type="number"
                  min="1"
                  step="any"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="field-label">المتبرع المسجل</label>
                <input
                  className="field-input"
                  type="text"
                  value={editingDonation.donorName}
                  disabled
                  style={{ background: "var(--border-soft)", cursor: "not-allowed" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: "0.5rem" }}>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => setEditingDonation(null)}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn btn--primary btn--sm"
                  disabled={editLoading}
                >
                  {editLoading ? "جاري التحديث..." : "حفظ التعديلات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Donation Details Modal */}
      {selectedDonation && (
        <div className="modal-backdrop" onClick={() => setSelectedDonation(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal__header">
              <h3 className="modal__title">تفاصيل عملية التبرع #{selectedDonation.id}</h3>
              <button
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-text)" }}
                onClick={() => setSelectedDonation(null)}
              >
                <FiX size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", padding: "0.5rem 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                <span className="muted" style={{ fontSize: "0.82rem" }}>رقم العملية:</span>
                <span style={{ fontWeight: 700 }}>#{selectedDonation.id}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                <span className="muted" style={{ fontSize: "0.82rem" }}>المتبرع:</span>
                <span style={{ fontWeight: 600 }}>{selectedDonation.donorName}</span>
              </div>

              {selectedDonation.userId && (
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                  <span className="muted" style={{ fontSize: "0.82rem" }}>معرف المستخدم (User ID):</span>
                  <span style={{ fontSize: "0.75rem", fontFamily: "monospace" }}>{selectedDonation.userId}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                <span className="muted" style={{ fontSize: "0.82rem" }}>الحملة الخيرية:</span>
                <span style={{ fontWeight: 600 }}>{selectedDonation.campaignTitle}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                <span className="muted" style={{ fontSize: "0.82rem" }}>المبلغ المتبرع به:</span>
                <span style={{ color: "var(--brand-green)", fontWeight: 800, fontSize: "1rem" }}>
                  {selectedDonation.amount.toLocaleString("ar-EG")} ج.م
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                <span className="muted" style={{ fontSize: "0.82rem" }}>تاريخ ووقت المعاملة:</span>
                <span style={{ fontSize: "0.82rem" }}>
                  {selectedDonation.date ? new Date(selectedDonation.date).toLocaleString("ar-EG") : "—"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 4 }}>
                <span className="muted" style={{ fontSize: "0.82rem" }}>حالة العملية:</span>
                <span className={`badge ${selectedDonation.isDeleted ? "badge--gray" : "badge--green"}`}>
                  {selectedDonation.status}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem", gap: 8 }}>
              <button className="btn btn--outline btn--sm" onClick={() => setSelectedDonation(null)}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal__header">
              <h3 className="modal__title" style={{ color: "#dc2626" }}>تأكيد حذف التبرع</h3>
              <button
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-text)" }}
                onClick={() => setDeleteConfirmId(null)}
              >
                <FiX size={18} />
              </button>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--heading-text)", margin: "0.75rem 0 1.25rem", lineHeight: 1.6 }}>
              هل أنت متأكد من حذف سجل التبرع رقم <strong>#{deleteConfirmId}</strong>؟ سيتم تصنيف التبرع كمحذوف (حذف ناعم Soft Delete) مع إمكانية استعادته لاحقاً.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn btn--outline btn--sm" onClick={() => setDeleteConfirmId(null)}>
                إلغاء
              </button>
              <button
                className="btn btn--danger btn--sm"
                disabled={actionLoadingId === deleteConfirmId}
                onClick={() => handleDelete(deleteConfirmId)}
              >
                {actionLoadingId === deleteConfirmId ? "جاري الحذف..." : "تأكيد الحذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
