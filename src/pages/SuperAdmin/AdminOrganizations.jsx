import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiCheckCircle, FiAlertCircle, FiUserPlus, FiEye } from "react-icons/fi";
import DashboardLayout from "../../components/DashboardLayout";
import Button from "../../components/Button";
import { assignOrganizationAdmin, createOrganization, deleteOrganization, getDeletedOrganizations, getOrganizationDetails, getOrganizations, getUsers, restoreOrganization, updateOrganization } from "../../services/adminApi";

export default function AdminOrganizations() {
  const [orgs, setOrgs] = useState([]);
  const [modal, setModal] = useState(false);
  const [adminModal, setAdminModal] = useState(false);
  const [adminOrg, setAdminOrg] = useState(null);
  const [detailsOrg, setDetailsOrg] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [adminUserId, setAdminUserId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
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

  const openAdminModal = async (organization) => {
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

  const openDetailsModal = async (organization) => {
    setDetailsOrg({ ...organization });
    setDetailsLoading(true);
    try {
      const details = await getOrganizationDetails(organization.id);
      setDetailsOrg(details || organization);
      console.log(details);
    } catch {
      setError("تعذر تحميل تفاصيل المنظمة.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetailsModal = () => setDetailsOrg(null);

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

  const openEditModal = (organization) => {
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

  const handleDelete = async (id) => {
    try { await deleteOrganization(id); await loadOrganizations(); } catch { setError("تعذر حذف المنظمة."); }
  };

  const handleRestore = async (id) => {
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
      <div className="responsive-stats-grid" style={{ marginBottom: "1.25rem" }}>
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
        {/* Desktop Table View */}
        <div className="table-desktop-view">
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>المنظمة</th>
                  <th>الموقع</th>
                  <th>الحملات</th>
                  <th>بوابة الدفع</th>
                  <th>الحالة</th>
                  <th style={{ textAlign: "center" }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>جار تحميل المنظمات...</td></tr> : null}
                {!loading && orgs.length === 0 ? <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>لا توجد منظمات.</td></tr> : null}
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
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                        {deleted ? (
                          <button className="btn btn--outline btn--sm" style={{ display: "flex", alignItems: "center", gap: 4 }} onClick={() => handleRestore(o.id)}>
                            <FiRefreshCw size={11} /> استعادة
                          </button>
                        ) : (
                          <>
                            <button className="btn btn--ghost btn--sm" style={{ padding: "4px 8px" }} onClick={() => openDetailsModal(o)} aria-label={`عرض تفاصيل ${name}`} title="عرض التفاصيل">
                              <FiEye size={12} />
                            </button>
                            <button className="btn btn--ghost btn--sm" style={{ padding: "4px 8px" }} onClick={() => openEditModal(o)} aria-label={`تعديل ${name}`} title="تعديل">
                              <FiEdit2 size={12} />
                            </button>
                            <button className="btn btn--ghost btn--sm" style={{ padding: "4px 8px" }} onClick={() => openAdminModal(o)} aria-label={`تعيين مسؤول ${name}`} title="تعيين مسؤول">
                              <FiUserPlus size={12} />
                            </button>
                            <button className="btn btn--ghost btn--sm" style={{ padding: "4px 8px", color: "var(--error)" }} onClick={() => handleDelete(o.id)} title="حذف">
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
              جار تحميل المنظمات...
            </div>
          ) : orgs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem" }} className="muted">
              لا توجد منظمات مسجلة.
            </div>
          ) : (
            orgs.map((o) => {
              const name = o.name || o.organizationName || "-";
              const deleted = Boolean(o.deleted || o.isDeleted);
              const campaigns = o.campaignsCount ?? o.campaignCount ?? o.campaigns?.length ?? 0;
              const payment = Boolean(o.hasPaymentInfo || o.paymentInfo || o.payment);

              return (
                <div key={o.id} className="mobile-table-card" style={{ opacity: deleted ? 0.65 : 1 }}>
                  <div className="mobile-table-card__header">
                    <div className="mobile-table-card__title">{name}</div>
                    <div className="mobile-table-card__badges">
                      {payment ? (
                        <span className="badge badge--green" style={{ fontSize: "0.7rem", display: "inline-flex", alignItems: "center", gap: 3 }}>
                          <FiCheckCircle size={9} /> دفع مفعّل
                        </span>
                      ) : (
                        <span className="badge badge--red" style={{ fontSize: "0.7rem", display: "inline-flex", alignItems: "center", gap: 3 }}>
                          <FiAlertCircle size={9} /> بدون دفع
                        </span>
                      )}
                      <span className={`badge ${deleted ? "badge--red" : "badge--green"}`}>
                        {deleted ? "محذوفة" : "نشطة"}
                      </span>
                    </div>
                  </div>

                  <div className="mobile-table-card__grid">
                    <div>
                      <div className="mobile-table-card__field-label">العنوان</div>
                      <div className="mobile-table-card__field-val" style={{ fontSize: "0.8rem" }}>
                        {o.address || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="mobile-table-card__field-label">الحملات</div>
                      <div className="mobile-table-card__field-val" style={{ fontWeight: 700 }}>
                        {campaigns}
                      </div>
                    </div>
                    <div>
                      <div className="mobile-table-card__field-label">المعرف</div>
                      <div className="mobile-table-card__field-val">#{o.id}</div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mobile-table-card__actions">
                    {deleted ? (
                      <button
                        className="btn btn--outline btn--sm"
                        onClick={() => handleRestore(o.id)}
                      >
                        <FiRefreshCw size={12} /> استعادة
                      </button>
                    ) : (
                      <>
                        <button
                          className="btn btn--outline btn--sm"
                          onClick={() => openDetailsModal(o)}
                        >
                          <FiEye size={13} /> تفاصيل
                        </button>
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => openEditModal(o)}
                        >
                          <FiEdit2 size={13} /> تعديل
                        </button>
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => openAdminModal(o)}
                        >
                          <FiUserPlus size={13} /> مسؤول
                        </button>
                        <button
                          className="btn btn--ghost btn--sm"
                          style={{ color: "var(--error)" }}
                          onClick={() => handleDelete(o.id)}
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
                      {user.FullName || user.userName || user.name || user.email || user.id}
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

      {detailsOrg && (
        <div className="modal-backdrop" onClick={closeDetailsModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">تفاصيل المنظمة</h3>
              <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={closeDetailsModal}>✕</button>
            </div>
            {detailsLoading ? <div className="muted">جار تحميل التفاصيل...</div> : (
              <div style={{ display: "grid", gap: "0.7rem" }}>
                <div><strong>الاسم:</strong> {detailsOrg.name || detailsOrg.organizationName || "-"}</div>
                <div><strong>العنوان:</strong> {detailsOrg.address || "-"}</div>
                <div><strong>الوصف:</strong> {detailsOrg.description || "-"}</div>
                <div><strong>الحملات المشتركة:</strong> {detailsOrg.sharedCampaignsCount ??  0}</div>
                 <div><strong >الحملات المنفرده:</strong> {detailsOrg.soloCampaignsCount ??  0}</div>
                 <div><strong >مجموع الحملات:</strong> {detailsOrg.totalCampaignsCount ??  0}</div>
                <div><strong>بوابة الدفع:</strong> {detailsOrg.PaymentInfo !=null ? "مفعّلة" : "غير مفعّلة"}</div>
                <div><strong>مسؤولو المنظمة:</strong>{detailsOrg.users && detailsOrg.users.length > 0 ? (
              <ul style={{ margin: "5px 0 0 20px", padding: 0 }}>
                {detailsOrg.users.map((adminUser, index) => (
                  <li key={adminUser.id || index} style={{ marginBottom: "4px" }}>
                    <span>{`الاسم: ${adminUser.fullName || adminUser.userName || "-"}`}</span>
                    <span style={{ margin: "0 8px", color: "var(--muted-text)" }}>•</span>
                    <span>{`البريد: ${adminUser.email || "-"}`}</span>
                  </li>
                ))}
              </ul>
            ) : (
              " -" 
            )}</div>
                <div>
            <strong>طرق التواصل:</strong> 
            {detailsOrg.contactMethods && detailsOrg.contactMethods.length > 0 ? (
              <ul style={{ margin: "5px 0 0 20px", padding: 0 }}>
                {detailsOrg.contactMethods.map((method, index) => (
  <li key={index}>
    {method.type ? `${method.type}: ${method.value}` : method}
  </li>
))}
              </ul>
            ) : (
              " -" 
            )}
          </div>
                <div><strong>تاريخ التحديث:</strong> {detailsOrg.updatedOn ?new Date(detailsOrg.updatedOn).toLocaleDateString("ar-EG")  :  "-"}</div>
                <div><strong>تاريخ الإنشاء:</strong> {detailsOrg.registrationDate ?new Date(detailsOrg.registrationDate).toLocaleDateString("ar-EG")  :  "-"}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
