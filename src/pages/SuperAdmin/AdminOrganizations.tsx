import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiCheckCircle, FiAlertCircle, FiUserPlus } from "react-icons/fi";
import DashboardLayout from "../../components/DashboardLayout";
import Button from "../../components/Button";
import { assignOrganizationAdmin, createOrganization, deleteOrganization, getDeletedOrganizations, getOrganizations, getUsers, restoreOrganization, updateOrganization } from "../../services/adminApi";

export default function AdminOrganizations() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [adminModal, setAdminModal] = useState(false);
  const [adminOrg, setAdminOrg] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [adminUserId, setAdminUserId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [editingOrg, setEditingOrg] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      setOrgs(showDeleted ? await getDeletedOrganizations() : await getOrganizations(false));
    } catch {
      setError("تعذر تحميل المنظمات.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, [showDeleted]);

  const openAdminModal = async (organization: any) => {
    setAdminOrg(organization);
    setAdminUserId("");
    setAdminModal(true);
    try {
      setUsers(await getUsers(false));
    } catch {
      setError("تعذر تحميل المستخدمين.");
    }
  };

  const closeAdminModal = () => {
    setAdminModal(false);
    setAdminOrg(null);
    setAdminUserId("");
  };

  const handleAssignAdmin = async () => {
    if (!adminOrg || !adminUserId) return;
    setAssigning(true);
    try {
      await assignOrganizationAdmin(adminOrg.id, adminUserId);
      closeAdminModal();
      await loadOrganizations();
    } catch {
      setError("تعذر تعيين مسؤول المنظمة.");
    } finally {
      setAssigning(false);
    }
  };

  const openCreateModal = () => {
    setEditingOrg(null);
    setOrgName("");
    setAddress("");
    setDescription("");
    setModal(true);
  };

  const openEditModal = (organization: any) => {
    setEditingOrg(organization);
    setOrgName(organization.name || organization.organizationName || "");
    setAddress(organization.address || "");
    setDescription(organization.description || "");
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setEditingOrg(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { name: orgName, address, description };
      if (editingOrg) {
        await updateOrganization(editingOrg.id, payload);
      } else {
        await createOrganization(payload);
      }
      await loadOrganizations();
      closeModal();
      setOrgName("");
      setAddress("");
      setDescription("");
    } catch {
      setError(editingOrg ? "تعذر تحديث المنظمة." : "تعذر إنشاء المنظمة.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try { await deleteOrganization(id); await loadOrganizations(); } catch { setError("تعذر حذف المنظمة."); }
  };

  const handleRestore = async (id: string | number) => {
    try { await restoreOrganization(id); await loadOrganizations(); } catch { setError("تعذر استعادة المنظمة."); }
  };

  return (
    <DashboardLayout role="admin">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--heading-text)" }}>إدارة المنظمات</h1>
        <Button size="sm" onClick={openCreateModal} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <FiPlus size={13} /> منظمة جديدة
        </Button>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.25rem" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
          <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} />
          عرض المنظمات المحذوفة
        </label>
      </div>

      {/* Payment status summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.25rem" }}>
        <div className="card" style={{ padding: "1rem" }}>
          <div style={{ fontWeight: 700, fontSize: "0.72rem", color: "var(--muted-text)", marginBottom: 4 }}>مع بوابة دفع</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <FiCheckCircle color="var(--brand-green)" size={16} />
            <span style={{ fontWeight: 800, fontSize: "1.2rem" }}>{orgs.filter((o) => o.payment && !o.deleted).length}</span>
          </div>
        </div>
        <div className="card" style={{ padding: "1rem", border: "1px solid #ffe082" }}>
          <div style={{ fontWeight: 700, fontSize: "0.72rem", color: "#8a6400", marginBottom: 4 }}>بدون بوابة دفع</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <FiAlertCircle color="#c9a570" size={16} />
            <span style={{ fontWeight: 800, fontSize: "1.2rem" }}>{orgs.filter((o) => !o.payment && !o.deleted).length}</span>
          </div>
        </div>
      </div>

      <div className="card">
        {error ? <div className="alert alert--error">{error}</div> : null}
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>المنظمة</th>
                <th>الموقع</th>
                <th>الحملات</th>
                <th>بوابة الدفع</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6}>جار تحميل المنظمات...</td></tr> : null}
              {!loading && orgs.length === 0 ? <tr><td colSpan={6}>لا توجد منظمات.</td></tr> : null}
              {!loading && orgs.map((o) => {
                const name = o.name || o.organizationName || "-";
                const deleted = Boolean(o.deleted || o.isDeleted);
                const campaigns = o.campaignsCount ?? o.campaignCount ?? o.campaigns?.length ?? 0;
                const payment = Boolean(o.hasPaymentInfo || o.paymentInfo || o.payment);
                return (
                <tr key={o.id} style={{ opacity: o.deleted ? 0.5 : 1 }}>
                  <td style={{ fontWeight: 600 }}>{name}</td>
                  <td className="muted">{o.address || "-"}</td>
                  <td>{campaigns}</td>
                  <td>
                    {payment
                      ? <span className="badge badge--green"><FiCheckCircle size={9} /> مفعّل</span>
                      : <span className="badge badge--red"><FiAlertCircle size={9} /> غير مفعّل</span>
                    }
                  </td>
                  <td>
                    <span className={`badge ${deleted ? "badge--red" : "badge--green"}`}>
                      {deleted ? "محذوفة" : "نشطة"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      {deleted ? (
                        <button className="btn btn--outline btn--sm" style={{ display: "flex", alignItems: "center", gap: 4 }} onClick={() => handleRestore(o.id)}>
                          <FiRefreshCw size={11} /> استعادة
                        </button>
                      ) : (
                        <>
                          <button className="btn btn--ghost btn--sm" style={{ padding: "4px 8px" }} onClick={() => openEditModal(o)} aria-label={`تعديل ${name}`}>
                            <FiEdit2 size={12} />
                          </button>
                          <button className="btn btn--ghost btn--sm" style={{ padding: "4px 8px" }} onClick={() => openAdminModal(o)} aria-label={`تعيين مسؤول ${name}`}>
                            <FiUserPlus size={12} />
                          </button>
                          <button className="btn btn--ghost btn--sm" style={{ padding: "4px 8px", color: "var(--error)" }} onClick={() => handleDelete(o.id)}>
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

      {modal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">{editingOrg ? "تعديل المنظمة" : "إضافة منظمة جديدة"}</h3>
              <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={closeModal}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div className="form-group">
                <label className="field-label">اسم المنظمة</label>
                <input className="field-input" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="أدخل اسم المنظمة" />
              </div>
              <div className="form-group">
                <label className="field-label">العنوان</label>
                <input className="field-input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="المحافظة، المدينة" />
              </div>
              <div className="form-group">
                <label className="field-label">نبذة تعريفية</label>
                <textarea className="field-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف مختصر عن المنظمة..." />
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn btn--ghost btn--sm" onClick={closeModal}>إلغاء</button>
                <Button size="sm" isLoading={saving} onClick={handleSave}>{editingOrg ? "حفظ" : "إنشاء"}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {adminModal && (
        <div className="modal-backdrop" onClick={closeAdminModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">تعيين مسؤول المنظمة</h3>
              <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={closeAdminModal}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div className="form-group">
                <label className="field-label">المنظمة</label>
                <input className="field-input" value={adminOrg?.name || adminOrg?.organizationName || ""} disabled />
              </div>
              <div className="form-group">
                <label className="field-label">المستخدم</label>
                <select className="field-input" value={adminUserId} onChange={(e) => setAdminUserId(e.target.value)}>
                  <option value="">اختر مستخدماً</option>
                  {users.filter((user) => !user.deleted && !user.isDeleted).map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName || user.userName || user.name || user.email || user.id}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn btn--ghost btn--sm" onClick={closeAdminModal}>إلغاء</button>
                <Button size="sm" isLoading={assigning} disabled={!adminUserId} onClick={handleAssignAdmin}>تعيين</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
