import { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiPauseCircle, FiPlayCircle } from "react-icons/fi";
import DashboardLayout from "../../components/DashboardLayout";
import Button from "../../components/Button";
import ProgressBar from "../../components/ProgressBar";

const CAMPAIGNS = [
  { id: 1, title: "مساعدة الأسر المتضررة", type: "فردية", status: "نشطة", collected: 85000, target: 120000, daysLeft: 14 },
  { id: 2, title: "توزيع ملابس الشتاء", type: "فردية", status: "نشطة", collected: 42000, target: 50000, daysLeft: 7 },
  { id: 3, title: "دعم أرامل وأيتام الشهداء", type: "مشتركة", status: "نشطة", collected: 55000, target: 150000, daysLeft: 45 },
  { id: 4, title: "مشروع إعمار المساجد", type: "فردية", status: "منتهية", collected: 200000, target: 200000, daysLeft: 0 },
];

type Modal = "create" | "edit" | null;

export default function OrgCampaigns() {
  const [modal, setModal] = useState<Modal>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [type, setType] = useState("solo");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setModal(null);
  };

  return (
    <DashboardLayout role="org">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--heading-text)" }}>إدارة الحملات</h1>
        <Button size="sm" onClick={() => { setTitle(""); setTarget(""); setModal("create"); }} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <FiPlus size={13} /> حملة جديدة
        </Button>
      </div>

      <div className="card">
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>عنوان الحملة</th>
                <th>النوع</th>
                <th>الحالة</th>
                <th>التقدم</th>
                <th>الأيام المتبقية</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {CAMPAIGNS.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.title}</td>
                  <td><span className={`badge ${c.type === "مشتركة" ? "badge--blue" : "badge--gray"}`}>{c.type}</span></td>
                  <td><span className={`badge ${c.status === "نشطة" ? "badge--green" : "badge--gray"}`}>{c.status}</span></td>
                  <td style={{ minWidth: 140 }}>
                    <ProgressBar value={c.collected} max={c.target} label />
                  </td>
                  <td className="muted">{c.daysLeft > 0 ? `${c.daysLeft} يوم` : "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn btn--ghost btn--sm" style={{ padding: "4px 8px" }} onClick={() => { setSelected(c.id); setTitle(c.title); setModal("edit"); }}>
                        <FiEdit2 size={12} />
                      </button>
                      {c.status === "نشطة" ? (
                        <button className="btn btn--ghost btn--sm" style={{ padding: "4px 8px", color: "var(--error)" }}>
                          <FiPauseCircle size={12} />
                        </button>
                      ) : (
                        <button className="btn btn--ghost btn--sm" style={{ padding: "4px 8px", color: "var(--brand-green)" }}>
                          <FiPlayCircle size={12} />
                        </button>
                      )}
                      <button className="btn btn--ghost btn--sm" style={{ padding: "4px 8px", color: "var(--error)" }}>
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">{modal === "create" ? "إنشاء حملة جديدة" : "تعديل الحملة"}</h3>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-text)" }} onClick={() => setModal(null)}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div className="form-group">
                <label className="field-label">عنوان الحملة</label>
                <input className="field-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="أدخل عنوان الحملة" />
              </div>
              <div className="form-group">
                <label className="field-label">نوع الحملة</label>
                <select className="field-select" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="solo">فردية</option>
                  <option value="shared">مشتركة</option>
                </select>
              </div>
              <div className="form-group">
                <label className="field-label">المبلغ المستهدف (ج.م)</label>
                <input className="field-input" type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="field-label">وصف الحملة</label>
                <textarea className="field-textarea" placeholder="أدخل وصفاً مفصلاً للحملة..." />
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn btn--ghost btn--sm" onClick={() => setModal(null)}>إلغاء</button>
                <Button isLoading={saving} size="sm" onClick={handleSave}>حفظ</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
