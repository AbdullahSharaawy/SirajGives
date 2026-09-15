import { useEffect, useState } from "react";
import { FiSearch, FiTrash2, FiRefreshCw, FiShield, FiUser } from "react-icons/fi";
import DashboardLayout from "../../components/DashboardLayout";
import Button from "../../components/Button";
import { deleteUser, getUsers, restoreUser, seedSuperAdmin } from "../../services/adminApi";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleSeed = async () => {
    if (!window.confirm("تحذير: هل أنت متأكد من تهيئة مستخدم SuperAdmin؟ هذا إجراء حساس.")) return;
    try {
      await seedSuperAdmin();
      await loadUsers();
    } catch {
      setError("تعذر تهيئة SuperAdmin.");
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteUser(id);
      await loadUsers();
    } catch {
      setError("تعذر حذف المستخدم.");
    }
  };

  const handleRestore = async (id: string | number) => {
    try {
      await restoreUser(id);
      await loadUsers();
    } catch {
      setError("تعذر استعادة المستخدم.");
    }
  };

  return (
    <DashboardLayout role="admin">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--heading-text)" }}>إدارة المستخدمين</h1>
        <button
          className="btn btn--danger btn--sm"
          style={{ display: "flex", alignItems: "center", gap: 5, opacity: 0.85 }}
          onClick={handleSeed}
        >
          <FiShield size={12} /> تهيئة SuperAdmin
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
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
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>المستخدم</th>
                <th>البريد الإلكتروني</th>
                <th>الأدوار</th>
                <th>تاريخ الانضمام</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5}>جار تحميل المستخدمين...</td></tr> : null}
              {!loading && filtered.length === 0 ? <tr><td colSpan={5}>لا توجد نتائج.</td></tr> : null}
              {!loading && filtered.map((u) => {
                const name = u.fullName || u.userName || u.name || "-";
                const roles = u.roles || u.userRoles || [];
                const joined = u.createdAt || u.joined || "-";
                return <tr key={u.id} style={{ opacity: u.deleted ? 0.55 : 1 }}>
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
                      {roles.map((r: string | { name?: string }) => {
                        const role = typeof r === "string" ? r : r.name || "-";
                        return <span key={role} className={`badge ${role === "SuperAdmin" ? "badge--red" : role === "OrgAdmin" ? "badge--gold" : "badge--blue"}`}>{role}</span>;
                      })}
                    </div>
                  </td>
                  <td className="muted">{joined}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      {u.deleted ? (
                        <button className="btn btn--outline btn--sm" style={{ display: "flex", alignItems: "center", gap: 4 }} onClick={() => handleRestore(u.id)}>
                          <FiRefreshCw size={11} /> استعادة
                        </button>
                      ) : (
                        <button className="btn btn--ghost btn--sm" style={{ padding: "4px 8px", color: "var(--error)" }} onClick={() => handleDelete(u.id)}>
                          <FiTrash2 size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
