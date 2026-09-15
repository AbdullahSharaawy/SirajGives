import { useState } from "react";
import { FiPlus, FiTrash2, FiShield, FiUserPlus } from "react-icons/fi";
import DashboardLayout from "../../components/DashboardLayout";
import Button from "../../components/Button";

const CONTACTS = [
  { id: 1, type: "هاتف", value: "+20 100 123 4567" },
  { id: 2, type: "بريد إلكتروني", value: "info@rahma.org.eg" },
  { id: 3, type: "موقع إلكتروني", value: "www.rahma.org.eg" },
];

const SUBADMINS = [
  { id: 1, name: "خالد مصطفى", email: "khaled@rahma.org.eg", role: "مساعد مدير" },
];

export default function OrgSettings() {
  const [tab, setTab] = useState<"profile" | "contacts" | "payment" | "subadmins">("profile");
  const [saving, setSaving] = useState(false);
  const [contacts, setContacts] = useState(CONTACTS);
  const [paymobKey, setPaymobKey] = useState("pk_test_••••••••••••••••••••••••");
  const [msg, setMsg] = useState("");
  const [orgName, setOrgName] = useState("جمعية الرحمة");

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    setMsg("تم الحفظ بنجاح");
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <DashboardLayout role="org">
      <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--heading-text)", marginBottom: "1.25rem" }}>إعدادات المنظمة</h1>

      <div className="tabs">
        {[["profile", "الملف الشخصي"], ["contacts", "وسائل التواصل"], ["payment", "إعدادات الدفع"], ["subadmins", "المساعدون"]].map(([id, label]) => (
          <button key={id} className={`tab${tab === id ? " tab--active" : ""}`} onClick={() => setTab(id as any)}>{label}</button>
        ))}
      </div>

      <div className="card" style={{ padding: "1.5rem", maxWidth: 560 }}>
        {tab === "profile" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--heading-text)" }}>بيانات المنظمة</h2>
            <div className="form-group">
              <label className="field-label">اسم المنظمة</label>
              <input className="field-input" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="field-label">العنوان</label>
              <input className="field-input" defaultValue="القاهرة، شارع المعز رقم 14" />
            </div>
            <div className="form-group">
              <label className="field-label">نبذة تعريفية</label>
              <textarea className="field-textarea" defaultValue="منظمة إنسانية تأسست عام 2010 لخدمة المجتمع وتقديم المساعدات للمحتاجين." />
            </div>
            {msg && <p className="success-message">{msg}</p>}
            <Button isLoading={saving} onClick={handleSave}>حفظ التغييرات</Button>
          </div>
        )}

        {tab === "contacts" && (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--heading-text)", marginBottom: "1rem" }}>وسائل التواصل</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
              {contacts.map((c) => (
                <div key={c.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <select className="field-select" defaultValue={c.type} style={{ width: 130 }}>
                    {["هاتف", "بريد إلكتروني", "موقع إلكتروني", "فاكس"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <input className="field-input" defaultValue={c.value} style={{ flex: 1 }} />
                  <button className="btn btn--ghost btn--sm" style={{ padding: "4px 8px", color: "var(--error)" }} onClick={() => setContacts(contacts.filter((x) => x.id !== c.id))}>
                    <FiTrash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <button className="btn btn--outline btn--sm" style={{ display: "flex", alignItems: "center", gap: 5 }} onClick={() => setContacts([...contacts, { id: Date.now(), type: "هاتف", value: "" }])}>
              <FiPlus size={12} /> إضافة وسيلة تواصل
            </button>
            <div style={{ marginTop: "1rem" }}>
              {msg && <p className="success-message">{msg}</p>}
              <Button isLoading={saving} onClick={handleSave}>حفظ</Button>
            </div>
          </div>
        )}

        {tab === "payment" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <FiShield color="var(--brand-green)" size={16} />
              <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--heading-text)" }}>بوابة Paymob</h2>
            </div>
            <div className="alert alert--info">يتم تشفير مفاتيح الدفع وتخزينها بأمان تام.</div>
            <div className="form-group">
              <label className="field-label">المفتاح الأساسي (API Key)</label>
              <input className="field-input" type="password" value={paymobKey} onChange={(e) => setPaymobKey(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="field-label">Integration ID</label>
              <input className="field-input" placeholder="مثال: 123456" />
            </div>
            <div className="form-group">
              <label className="field-label">HMAC Secret</label>
              <input className="field-input" type="password" placeholder="••••••••••••••••" />
            </div>
            {msg && <p className="success-message">{msg}</p>}
            <Button isLoading={saving} onClick={handleSave}>حفظ مفاتيح الدفع</Button>
          </div>
        )}

        {tab === "subadmins" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--heading-text)" }}>المساعدون الإداريون</h2>
              <button className="btn btn--outline btn--sm" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <FiUserPlus size={12} /> إضافة مساعد
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {SUBADMINS.map((s) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: "var(--bg-soft)", borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{s.name}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--muted-text)" }}>{s.email}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="badge badge--blue">{s.role}</span>
                    <button className="btn btn--ghost btn--sm" style={{ padding: "4px 8px", color: "var(--error)" }}><FiTrash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
