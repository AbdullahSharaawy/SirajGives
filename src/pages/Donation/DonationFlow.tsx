import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FiLock, FiCheckCircle, FiArrowRight } from "react-icons/fi";
import PageLayout from "../../components/PageLayout";
import Button from "../../components/Button";
import { createPayment } from "../../services/paymentApi";
import { getCampaign } from "../../services/campaignApi";
import { normalizeCampaign } from "../../utils/normalize";

type Step = "amount" | "payment" | "confirm";

export default function DonationFlow() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { kind, id } = useParams();
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState(params.get("amount") ?? "100");
  const [organizationId, setOrganizationId] = useState(params.get("organizationId") || "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const QUICK = ["50", "100", "250", "500", "1000", "2000"];

  useEffect(() => {
    if (!id || organizationId) return;
    getCampaign(id).then((campaign) => {
      const normalized = normalizeCampaign(campaign);
      if (normalized?.organizationId) setOrganizationId(String(normalized.organizationId));
    }).catch(() => undefined);
  }, [id, organizationId]);

  const handlePay = async () => {
    setLoading(true);
    setMsg("");
    try {
      const paymentUrl = await createPayment({
        amount: Number(amount),
        campaignId: Number(id),
        organizationId: organizationId ? Number(organizationId) : undefined,
      });
      const url = typeof paymentUrl === "string" ? paymentUrl : paymentUrl?.iframeUrl ?? paymentUrl?.url;
      if (typeof url === "string" && url.startsWith("http")) {
        window.location.href = url;
        return;
      }
      setMsg("تعذر الحصول على رابط الدفع من البوابة.");
    } catch (error: any) {
      setMsg(error.response?.data?.message || "تعذر إنشاء عملية الدفع.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div style={{ maxWidth: 500, margin: "2rem auto", padding: "0 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: "2rem" }}>
          {(["amount", "payment", "confirm"] as Step[]).map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, background: step === s ? "var(--accent-green)" : (["amount","payment","confirm"].indexOf(step) > i ? "var(--brand-green)" : "var(--border)"), color: step === s || ["amount","payment","confirm"].indexOf(step) > i ? "#fff" : "var(--muted-text)", transition: "all 0.2s" }}>
                {["amount","payment","confirm"].indexOf(step) > i ? <FiCheckCircle size={13} /> : i + 1}
              </div>
              {i < 2 && <div style={{ width: 40, height: 1, background: ["amount","payment","confirm"].indexOf(step) > i ? "var(--accent-green)" : "var(--border)" }} />}
            </div>
          ))}
        </div>

        {step === "confirm" ? (
          <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: "1.75rem", color: "var(--brand-green)" }}>
              <FiCheckCircle />
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--heading-text)", marginBottom: "0.5rem" }}>شكراً لتبرعك!</h2>
            <p className="muted" style={{ fontSize: "0.85rem", marginBottom: "1.5rem", lineHeight: 1.7 }}>
              تم استلام طلب تبرعك بمبلغ <strong style={{ color: "var(--brand-green)" }}>{Number(amount).toLocaleString("ar-EG")} ج.م</strong>.
            </p>
            <Button onClick={() => nav("/campaigns")}>تصفح حملات أخرى</Button>
          </div>
        ) : step === "amount" ? (
          <div className="card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--heading-text)", marginBottom: "1.25rem" }}>اختر مبلغ التبرع</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: "1rem" }}>
              {QUICK.map((q) => (
                <button key={q} className={`btn btn--sm${amount === q ? " btn--primary" : " btn--ghost"}`} onClick={() => setAmount(q)}>
                  {q} ج.م
                </button>
              ))}
            </div>
            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
              <label className="field-label">أو أدخل مبلغاً مخصصاً</label>
              <div className="field-wrapper">
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="field-input" placeholder="المبلغ بالجنيه المصري" min={1} />
              </div>
            </div>
            {msg && <p className="error-message" style={{ marginBottom: "0.75rem" }}>{msg}</p>}
            <Button full onClick={() => { if (!Number(amount) || Number(amount) < 1) { setMsg("يرجى إدخال مبلغ صحيح"); return; } setMsg(""); setStep("payment"); }}>
              متابعة
            </Button>
            <button className="btn btn--ghost btn--sm btn--full" style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }} onClick={() => nav(-1)}>
              <FiArrowRight size={13} /> رجوع
            </button>
          </div>
        ) : (
          <div className="card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--heading-text)", marginBottom: "0.35rem" }}>إتمام الدفع</h2>
            <p className="muted" style={{ fontSize: "0.78rem", marginBottom: "1.25rem" }}>ستتبرع بمبلغ <strong style={{ color: "var(--brand-green)" }}>{Number(amount).toLocaleString("ar-EG")} ج.م</strong>{kind ? ` للحملة ${kind}` : ""}</p>

            <div className="alert alert--info" style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 6 }}>
              <FiLock size={13} /> سيتم تحويلك إلى بوابة Paymob الآمنة لإدخال بيانات البطاقة
            </div>

            {msg && <p className="error-message" style={{ marginBottom: "0.75rem" }}>{msg}</p>}
            <Button full isLoading={loading} onClick={handlePay}>
              المتابعة للدفع {Number(amount).toLocaleString("ar-EG")} ج.م
            </Button>
            <button className="btn btn--ghost btn--sm btn--full" style={{ marginTop: 8 }} onClick={() => setStep("amount")}>رجوع</button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
