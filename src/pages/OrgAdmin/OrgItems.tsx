import { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiUpload } from "react-icons/fi";
import DashboardLayout from "../../components/DashboardLayout";
import Button from "../../components/Button";

const ITEMS = [
  { id: 1, name: "ملابس أطفال (6-12 شهر)", category: "ملابس", available: true, donor: "متبرع مجهول" },
  { id: 2, name: "كراسي متحركة للمعاقين", category: "طبي", available: true, donor: "محمد أحمد" },
  { id: 3, name: "حقائب مدرسية وأدوات قرطاسية", category: "تعليم", available: false, donor: "شركة المستقبل" },
  { id: 4, name: "مواد غذائية جافة (كرتون)", category: "غذاء", available: true, donor: "أسرة السيد" },
];

const CATS = ["ملابس", "طبي", "تعليم", "غذاء", "أثاث", "أخرى"];

export default function OrgItems() {
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState(ITEMS);
  const [name, setName] = useState("");
  const [cat, setCat] = useState(CATS[0]);

  const toggleAvail = (id: number) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, available: !i.available } : i)));

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setModal(false);
    setName("");
  };

  return (
    <DashboardLayout role="org">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--heading-text)" }}>إدارة العطاء العيني</h1>
        <Button size="sm" onClick={() => setModal(true)} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <FiPlus size={13} /> إضافة صنف
        </Button>
      </div>

      {/* Inventory summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
        {CATS.map((c) => {
          const count = items.filter((i) => i.category === c).length;
          return count > 0 ? (
            <div key={c} className="stat-card" style={{ padding: "0.75rem 1rem" }}>
              <div className="stat-card__label">{c}</div>
              <div className="stat-card__value" style={{ fontSize: "1.2rem" }}>{count}</div>
            </div>
          ) : null;
        })}
      </div>

      <div className="card">
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>اسم الصنف</th>
                <th>الفئة</th>
                <th>المتبرع</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td><span className="badge badge--gray">{item.category}</span></td>
                  <td className="muted">{item.donor}</td>
                  <td>
                    <span className={`badge ${item.available ? "badge--green" : "badge--red"}`}>
                      {item.available ? "متاح" : "غير متاح"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn btn--ghost btn--sm" style={{ padding: "4px 8px" }} onClick={() => toggleAvail(item.id)}>
                        {item.available ? <FiToggleRight size={14} color="var(--brand-green)" /> : <FiToggleLeft size={14} />}
                      </button>
                      <button className="btn btn--ghost btn--sm" style={{ padding: "4px 8px" }}><FiEdit2 size={12} /></button>
                      <button className="btn btn--ghost btn--sm" style={{ padding: "4px 8px", color: "var(--error)" }}><FiTrash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">إضافة صنف جديد</h3>
              <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setModal(false)}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div className="form-group">
                <label className="field-label">اسم الصنف</label>
                <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: ملابس أطفال" />
              </div>
              <div className="form-group">
                <label className="field-label">الفئة</label>
                <select className="field-select" value={cat} onChange={(e) => setCat(e.target.value)}>
                  {CATS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="field-label">صورة الصنف</label>
                <div className="upload-zone">
                  <FiUpload size={20} style={{ color: "var(--muted-text)", marginBottom: 6 }} />
                  <p style={{ fontSize: "0.78rem", color: "var(--muted-text)" }}>اسحب صورة هنا أو انقر للتصفح</p>
                </div>
              </div>
              <div className="form-group">
                <label className="field-label">وصف الصنف</label>
                <textarea className="field-textarea" placeholder="وصف مختصر..." />
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn btn--ghost btn--sm" onClick={() => setModal(false)}>إلغاء</button>
                <Button size="sm" isLoading={saving} onClick={handleSave}>إضافة</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
