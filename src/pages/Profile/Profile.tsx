import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiLock, FiHeart, FiEdit2, FiSave } from "react-icons/fi";
import PageLayout from "../../components/PageLayout";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { changePassword, updateProfile } from "../../services/userApi";
import { getUserDonationHistory } from "../../services/donationApi";

export default function Profile() {
  const { user, isAuth } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<"profile" | "history" | "password">("profile");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pw, setPw] = useState({ old: "", new: "", confirm: "" });
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
  }, [user?.name, user?.email]);

  useEffect(() => {
    if (!user?.id) return;
    getUserDonationHistory(user.id)
      .then((items) => setHistory(Array.isArray(items) ? items : items?.items ?? []))
      .catch((err) => {
        if (err.response?.status === 403) setError("");
        else setError("تعذر تحميل سجل التبرعات.");
      });
  }, [user?.id]);

  if (!isAuth) {
    return (
      <PageLayout>
        <div className="empty-state" style={{ padding: "4rem 1rem" }}>
          <div className="empty-state__icon">🔒</div>
          <div className="empty-state__text" style={{ marginBottom: "1rem" }}>يجب تسجيل الدخول لعرض هذه الصفحة</div>
          <button className="btn btn--primary" onClick={() => nav("/login")}>تسجيل الدخول</button>
        </div>
      </PageLayout>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ fullName: name, email });
      setEditing(false);
    } catch {
      setError("تعذر حفظ البيانات الشخصية.");
    } finally {
      setSaving(false);
    }
  };

  const handlePw = async () => {
    if (pw.new !== pw.confirm) { setPwMsg("كلمة المرور الجديدة غير متطابقة"); return; }
    if (pw.new.length < 6) { setPwMsg("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
    setSaving(true);
    try {
      await changePassword({
        currentPassword: pw.old,
        newPassword: pw.new,
        confirmPassword: pw.confirm,
        confirmNewPassword: pw.confirm,
      });
      setPwMsg("تم تغيير كلمة المرور بنجاح");
      setPw({ old: "", new: "", confirm: "" });
    } catch {
      setPwMsg("تعذر تغيير كلمة المرور.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout>
      <div className="page-header">
        <div className="page-container">
          <h1 className="page-title">حسابي</h1>
        </div>
      </div>

      <div className="page-container" style={{ padding: "1.5rem 1.25rem" }}>
        {error && <div className="alert alert--error" style={{ marginBottom: "1rem" }}>{error}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "1.5rem" }}>
          {/* Side nav */}
          <div className="card" style={{ padding: "0.5rem", height: "fit-content" }}>
            {[
              { id: "profile", label: "بياناتي", icon: <FiUser size={14} /> },
              { id: "history", label: "سجل التبرعات", icon: <FiHeart size={14} /> },
              { id: "password", label: "تغيير كلمة المرور", icon: <FiLock size={14} /> },
            ].map((item) => (
              <button
                key={item.id}
                className={`sidebar__item${tab === item.id ? " sidebar__item--active" : ""}`}
                style={{ width: "100%", border: "none", background: "none", textAlign: "right", cursor: "pointer", borderRadius: 6 }}
                onClick={() => setTab(item.id as any)}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="card" style={{ padding: "1.5rem" }}>
            {tab === "profile" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                  <h2 className="section-title">البيانات الشخصية</h2>
                  <button className="btn btn--outline btn--sm" style={{ display: "flex", alignItems: "center", gap: 5 }} onClick={() => setEditing(!editing)}>
                    <FiEdit2 size={12} /> {editing ? "إلغاء" : "تعديل"}
                  </button>
                </div>

                <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--bg-soft)", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", color: "var(--accent-green)", flexShrink: 0 }}>
                    {name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                    <div className="form-group">
                      <label className="field-label">الاسم الكامل</label>
                      <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} disabled={!editing} />
                    </div>
                    <div className="form-group">
                      <label className="field-label">البريد الإلكتروني</label>
                      <input className="field-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!editing} />
                    </div>
                    {editing && (
                      <Button isLoading={saving} onClick={handleSave} style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 5 }}>
                        <FiSave size={13} /> حفظ التغييرات
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {tab === "history" && (
              <div>
                <h2 className="section-title" style={{ marginBottom: "1rem" }}>سجل التبرعات</h2>
                <div style={{ overflowX: "auto" }}>
                  {history.length === 0 ? (
                    <p className="muted">لا يوجد سجل تبرعات متاح لحسابك حالياً.</p>
                  ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>الحملة</th>
                        <th>المنظمة</th>
                        <th>المبلغ</th>
                        <th>التاريخ</th>
                        <th>الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h) => (
                        <tr key={h.id}>
                          <td style={{ fontWeight: 600 }}>{h.campaignName ?? h.campaign?.title ?? h.title ?? "-"}</td>
                          <td className="muted">{h.organizationName ?? h.organization?.name ?? "-"}</td>
                          <td style={{ color: "var(--brand-green)", fontWeight: 700 }}>{Number(h.amount ?? h.donationAmount ?? 0).toLocaleString("ar-EG")} ج.م</td>
                          <td className="muted">{h.createdAt ? new Date(h.createdAt).toLocaleDateString("en-CA") : h.date ?? "-"}</td>
                          <td><span className="badge badge--green">{h.status ?? "مكتمل"}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  )}
                </div>
                <div style={{ marginTop: "1rem", padding: "1rem", background: "var(--bg-soft)", borderRadius: 8, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>إجمالي التبرعات</span>
                  <span style={{ fontWeight: 800, color: "var(--brand-green)" }}>{history.reduce((sum, item) => sum + Number(item.amount ?? item.donationAmount ?? 0), 0).toLocaleString("ar-EG")} ج.م</span>
                </div>
              </div>
            )}

            {tab === "password" && (
              <div style={{ maxWidth: 360 }}>
                <h2 className="section-title" style={{ marginBottom: "1.25rem" }}>تغيير كلمة المرور</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div className="form-group">
                    <label className="field-label">كلمة المرور الحالية</label>
                    <input className="field-input" type="password" value={pw.old} onChange={(e) => setPw({ ...pw, old: e.target.value })} placeholder="••••••••" />
                  </div>
                  <div className="form-group">
                    <label className="field-label">كلمة المرور الجديدة</label>
                    <input className="field-input" type="password" value={pw.new} onChange={(e) => setPw({ ...pw, new: e.target.value })} placeholder="••••••••" />
                  </div>
                  <div className="form-group">
                    <label className="field-label">تأكيد كلمة المرور</label>
                    <input className="field-input" type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} placeholder="••••••••" />
                  </div>
                  {pwMsg && <p className={pwMsg.includes("بنجاح") ? "success-message" : "error-message"}>{pwMsg}</p>}
                  <Button isLoading={saving} onClick={handlePw}>تغيير كلمة المرور</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
