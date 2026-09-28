import { useEffect, useState } from "react";
import { FiSearch, FiTrash2, FiRefreshCw, FiShield, FiUser, FiEye, FiShieldOff } from "react-icons/fi";
import DashboardLayout from "../../components/DashboardLayout";
import Button from "../../components/Button";
import { assignUserRole,removeUserRole, deleteUser, getUsers, restoreUser } from "../../services/adminApi";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignRoleUser, setAssignRoleUser] = useState(null);
  const [removeRoleUser, setRemoveRoleUser] = useState(null);
  const [detailsUser, setDetailsUser] = useState(null);
  const [assigningRole, setAssigningRole] = useState(false);
  const [removingRole, setRemovingRole] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await getUsers(showDeleted));
    } catch {
      setError("تعذر تحميل المستخدمين.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [showDeleted]);

  const filtered = users.filter((u) => {
    const name = u.fullName || u.userName || u.name || "";
    const email = u.email || "";
    const deleted = Boolean(u.deleted || u.isDeleted);
    const ms = name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase());
    return ms && (showDeleted ? deleted : !deleted);
  });



  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      await loadUsers();
    } catch {
      setError("تعذر حذف المستخدم.");
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreUser(id);
      await loadUsers();
    } catch {
      setError("تعذر استعادة المستخدم.");
    }
  };

  const handleAssignSuperAdmin = async () => {
    if (!assignRoleUser) return;
    setAssigningRole(true);
    try {
      await assignUserRole(assignRoleUser.id, "SuperAdmin");
      setAssignRoleUser(null);
      await loadUsers();

    } catch {
      setError("تعذر تعيين دور SuperAdmin.");
    } finally {
      setAssigningRole(false);
    }
  };
const handleRemoveSuperAdmin = async () => {
    if (!removeRoleUser) return;
    setRemovingRole(true);
    try {
      await removeUserRole(removeRoleUser.id, "SuperAdmin");
      setRemoveRoleUser(null);
      await loadUsers();

    } catch {
      setError("تعذر الغاء دور SuperAdmin.");
    } finally {
      setRemovingRole(false);
    }
  };
  return (
    <DashboardLayout role="admin">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--heading-text)" }}>إدارة المستخدمين</h1>

      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالاسم أو البريد..." />
          <button><FiSearch size={14} /></button>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
          <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} />
          عرض المحذوفين
        </label>
      </div>

      <div className="card">
        {error ? <div className="alert alert--error">{error}</div> : null}
        
        {/* Desktop Table View */}
        <div className="table-desktop-view">
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>المستخدم</th>
                  <th>البريد الإلكتروني</th>
                  <th>الأدوار</th>
                  <th>العنوان</th>
                  <th>الهاتف</th>
                  <th>تاريخ الانضمام</th>
                  <th style={{ textAlign: "center" }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>جار تحميل المستخدمين...</td></tr> : null}
                {!loading && filtered.length === 0 ? <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>لا توجد نتائج.</td></tr> : null}
                {!loading && filtered.map((u) => {
                  const name = u.fullName || u.userName || "-";
                  const rawRoles = u.roles || [];
                  const roles = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
                  const isSuperAdmin = roles.some((r) => (typeof r === "string" ? r : r.name) === "SuperAdmin");
                  const joined = u.registrationDate || "-";
                  const deleted = Boolean(u.isDeleted);
                  return <tr key={u.id} style={{ opacity: u.isDeleted ? 0.55 : 1 }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--bg-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted-text)" }}>
                          <FiUser size={13} />
                        </div>
                        <span style={{ fontWeight: 600 }}>{name}</span>
                      </div>
                    </td>
                    <td className="muted">{u.email || "-"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                        {roles.map((r) => {
                          const role = typeof r === "string" ? r : r.name || "-";
                          return <span key={role} className={`badge ${role === "SuperAdmin" ? "badge--red" : role === "OrgAdmin" ? "badge--gold" : "badge--blue"}`}>{role}</span>;
                        })}
                      </div>
                    </td>
                    <td className="muted">{u.address || "-"}</td>
                    <td className="muted">{u.phoneNumber || "-"}</td>
                    <td className="muted">{joined ? new Date(joined).toLocaleDateString("ar-EG") : "-"}</td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                        {deleted ? (
                          <button className="btn btn--outline btn--sm" style={{ display: "flex", alignItems: "center", gap: 4 }} onClick={() => handleRestore(u.id)}>
                            <FiRefreshCw size={11} /> استعادة
                          </button>
                        ) : (
                          <>
                            <button className="btn btn--ghost btn--sm" style={{ padding: "4px 8px" }} onClick={() => setDetailsUser(u)} aria-label={`عرض تفاصيل ${name}`} title="عرض التفاصيل">
                              <FiEye size={12} />
                            </button>
                            {!isSuperAdmin ? (
                              <button className="btn btn--ghost btn--sm" style={{ padding: "4px 8px" }} onClick={() => setAssignRoleUser(u)} aria-label={`تعيين SuperAdmin لـ ${name}`} title="تعيين SuperAdmin">
                                <FiShield size={12} />
                              </button>
                            ) : (
                              <button
                                className="btn btn--ghost btn--sm"
                                style={{ padding: "4px 8px", color: "var(--error)" }}
                                onClick={() => setRemoveRoleUser(u)}
                                aria-label={`إزالة صلاحية SuperAdmin من ${name}`}
                                title="إزالة صلاحية SuperAdmin"
                              >
                                <FiShieldOff size={12} />
                              </button>
                            )}
                            <button className="btn btn--ghost btn--sm" style={{ padding: "4px 8px", color: "var(--error)" }} onClick={() => handleDelete(u.id)} aria-label={`حذف ${name}`} title="حذف">
                              <FiTrash2 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="cards-mobile-view">
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }} className="muted">
              جار تحميل المستخدمين...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem" }} className="muted">
              لا توجد نتائج مطابقة للبحث.
            </div>
          ) : (
            filtered.map((u) => {
              const name = u.fullName || u.userName || "-";
              const rawRoles = u.roles || [];
              const roles = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
              const isSuperAdmin = roles.some((r) => (typeof r === "string" ? r : r.name) === "SuperAdmin");
              const joined = u.registrationDate || "-";
              const deleted = Boolean(u.isDeleted);

              return (
                <div key={u.id} className="mobile-table-card" style={{ opacity: deleted ? 0.65 : 1 }}>
                  <div className="mobile-table-card__header">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--bg-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted-text)" }}>
                        <FiUser size={13} />
                      </div>
                      <div className="mobile-table-card__title">{name}</div>
                    </div>
                    <div className="mobile-table-card__badges">
                      {roles.map((r) => {
                        const role = typeof r === "string" ? r : r.name || "-";
                        return (
                          <span key={role} className={`badge ${role === "SuperAdmin" ? "badge--red" : role === "OrgAdmin" ? "badge--gold" : "badge--blue"}`}>
                            {role}
                          </span>
                        );
                      })}
                      {deleted && <span className="badge badge--red">محذوف</span>}
                    </div>
                  </div>

                  <div className="mobile-table-card__grid">
                    <div style={{ gridColumn: "span 2" }}>
                      <div className="mobile-table-card__field-label">البريد الإلكتروني</div>
                      <div className="mobile-table-card__field-val" style={{ fontSize: "0.8rem", wordBreak: "break-all" }}>
                        {u.email || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="mobile-table-card__field-label">الهاتف</div>
                      <div className="mobile-table-card__field-val" style={{ fontSize: "0.8rem" }}>
                        {u.phoneNumber || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="mobile-table-card__field-label">العنوان</div>
                      <div className="mobile-table-card__field-val" style={{ fontSize: "0.8rem" }}>
                        {u.address || "-"}
                      </div>
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <div className="mobile-table-card__field-label">تاريخ الانضمام</div>
                      <div className="mobile-table-card__field-val" style={{ fontSize: "0.75rem" }}>
                        {joined ? new Date(joined).toLocaleDateString("ar-EG") : "-"}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mobile-table-card__actions">
                    {deleted ? (
                      <button
                        className="btn btn--outline btn--sm"
                        onClick={() => handleRestore(u.id)}
                      >
                        <FiRefreshCw size={12} /> استعادة
                      </button>
                    ) : (
                      <>
                        <button
                          className="btn btn--outline btn--sm"
                          onClick={() => setDetailsUser(u)}
                        >
                          <FiEye size={13} /> تفاصيل
                        </button>
                        {!isSuperAdmin ? (
                          <button
                            className="btn btn--ghost btn--sm"
                            onClick={() => setAssignRoleUser(u)}
                          >
                            <FiShield size={13} /> ترقية SuperAdmin
                          </button>
                        ) : (
                          <button
                            className="btn btn--ghost btn--sm"
                            style={{ color: "var(--error)" }}
                            onClick={() => setRemoveRoleUser(u)}
                          >
                            <FiShieldOff size={13} /> إلغاء SuperAdmin
                          </button>
                        )}
                        <button
                          className="btn btn--ghost btn--sm"
                          style={{ color: "var(--error)" }}
                          onClick={() => handleDelete(u.id)}
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

      {assignRoleUser && (
        <div className="modal-backdrop" onClick={() => setAssignRoleUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">تعيين دور SuperAdmin</h3>
              <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setAssignRoleUser(null)}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div><strong>المستخدم:</strong> {assignRoleUser.fullName || assignRoleUser.userName || assignRoleUser.email || "-"}</div>
              <div><strong>الدور:</strong> SuperAdmin</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn btn--ghost btn--sm" onClick={() => setAssignRoleUser(null)}>إلغاء</button>
                <Button size="sm" isLoading={assigningRole} onClick={handleAssignSuperAdmin}>تعيين</Button>
              </div>
            </div>
          </div>
        </div>
      )}
 {removeRoleUser && (
        <div className="modal-backdrop" onClick={() => setRemoveRoleUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">الغاء دور SuperAdmin</h3>
              <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setRemoveRoleUser(null)}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div><strong>المستخدم:</strong> {removeRoleUser.fullName || removeRoleUser.userName || removeRoleUser.email || "-"}</div>
              <div><strong>الدور:</strong> SuperAdmin</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn btn--ghost btn--sm" onClick={() => setRemoveRoleUser(null)}>إلغاء</button>
                <Button size="sm" isLoading={removingRole} onClick={handleRemoveSuperAdmin}>إزالة الصلاحية</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {detailsUser && (
        <div className="modal-backdrop" onClick={() => setDetailsUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">تفاصيل المستخدم</h3>
              <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setDetailsUser(null)}>✕</button>
            </div>
            <div style={{ display: "grid", gap: "0.7rem" }}>
              <div><strong>الاسم:</strong> {detailsUser.fullName || "-"}</div>
              <div><strong>اسم المستخدم:</strong> {detailsUser.userName || "-"}</div>
              <div><strong>البريد الإلكتروني:</strong> {detailsUser.email || "-"}</div>
              <div><strong>الأدوار:</strong> {(Array.isArray(detailsUser.roles || detailsUser.userRoles) ? (detailsUser.roles || detailsUser.userRoles) : [detailsUser.roles || detailsUser.userRoles]).map((r) => typeof r === "string" ? r : r?.name || "-").join("، ") || "-"}</div>
              <div><strong>العنوان:</strong> {detailsUser.address || "-"}</div>
              <div><strong>الهاتف:</strong> {detailsUser.phoneNumber || "-"}</div>
              <div><strong>تاريخ الانضمام:</strong> {detailsUser.registrationDate ?new Date(detailsUser.registrationDate).toLocaleDateString("ar-EG")  : "-"}</div>
              <div><strong>تاريخ التحديث:</strong> {detailsUser.updatedOn ?new Date(detailsUser.updatedOn).toLocaleDateString("ar-EG")  : "-"}</div>
              <div><strong>الحالة:</strong> {detailsUser.isDeleted ? "محذوف" : "نشط"}</div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
