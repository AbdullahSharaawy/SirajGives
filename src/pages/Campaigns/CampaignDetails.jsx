import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiArrowRight, FiCalendar, FiUsers, FiHeart, FiShare2, FiCheckCircle } from "react-icons/fi";
import PageLayout from "../../components/PageLayout";
import ProgressBar from "../../components/ProgressBar";
import { useAuth } from "../../context/AuthContext";
import { getCampaign } from "../../services/campaignApi";
import { normalizeCampaign } from "../../utils/normalize";

export default function CampaignDetails() {
  const { kind, id } = useParams();
  const nav = useNavigate();
  const { isAuth } = useAuth();
  const [donateAmount, setDonateAmount] = useState("100");
  const [shared, setShared] = useState(false);
  const [c, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCampaign(id)
      .then((campaign) => {
        console.log(campaign);
        const normalized = normalizeCampaign(campaign);
        if (!normalized) {
          setError("تعذر العثور على الحملة.");
          return;
        }
        setCampaign(normalized);
      })
      .catch(() => setError("تعذر تحميل تفاصيل الحملة."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDonate = () => {
    if (!isAuth) { nav("/login", { state: { from: { pathname: `/campaigns/${kind}/${id}` } } }); return; }
    const orgQuery = c?.organizationId ? `&organizationId=${c.organizationId}` : "";
    nav(`/donate/${kind ?? (c?.isSolo ? "solo" : "shared")}/${id}?amount=${donateAmount}${orgQuery}`);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
    } catch {
      setShared(false);
    }
  };

  if (loading) {
    return <PageLayout><div className="page-container" style={{ padding: "2rem 1.25rem" }}>جاري تحميل الحملة...</div></PageLayout>;
  }

  if (error || !c) {
    return (
      <PageLayout>
        <div className="page-container" style={{ padding: "2rem 1.25rem" }}>
          <div className="alert alert--error">{error || "الحملة غير موجودة."}</div>
        </div>
      </PageLayout>
    );
  }

  const updates = Array.isArray(c.updates) ? c.updates : [];

  return (
    <PageLayout>
      <div className="page-container" style={{ padding: "1.5rem 1.25rem" }}>
        <button
          className="btn btn--ghost btn--sm"
          style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: 5 }}
          onClick={() => nav("/campaigns")}
        >
          <FiArrowRight size={13} /> العودة للحملات
        </button>

        <div className="responsive-details-layout">
          <div>
            {c.imageUrl ? (
              <img
                src={c.imageUrl}
                alt={c.title}
                style={{ width: "100%", height: "clamp(200px, 45vw, 340px)", objectFit: "cover", borderRadius: 10, marginBottom: "1.25rem", background: "var(--bg-soft)" }}
              />
            ) : (
              <div style={{ width: "100%", height: "clamp(160px, 35vw, 220px)", borderRadius: 10, marginBottom: "1.25rem", background: "var(--bg-soft)" }} />
            )}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "0.75rem" }}>
              {c.type && <span className="badge badge--green">{c.type}</span>}
              {c.status && <span className="badge badge--gray">{c.status}</span>}
              {!c.isSolo && <span className="badge badge--blue">حملة مشتركة</span>}
            </div>

            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--heading-text)", marginBottom: "0.35rem" }}>
              {c.title}
            </h1>
            <p style={{ color: "var(--muted-text)", fontSize: "0.82rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 6 }}>
              <FiUsers size={13} />
              {c.organizationName || "منظمة شريكة"}
            </p>

            <div style={{ background: "var(--bg-soft)", borderRadius: 10, padding: "1.25rem", marginBottom: "1.5rem" }}>
              <ProgressBar value={c.achieved} max={c.target} label />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.85rem", fontSize: "0.78rem", color: "var(--muted-text)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><FiHeart size={12} /> {Number(c.donors || 0).toLocaleString("ar-EG")} متبرع</span>
                {c.daysLeft != null && (
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}><FiCalendar size={12} /> {c.daysLeft} يوم متبقي</span>
                )}
              </div>
            </div>

            <h2 className="section-title" style={{ marginBottom: "0.75rem" }}>عن الحملة</h2>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.85, color: "var(--primary-text)", whiteSpace: "pre-line", marginBottom: "1.5rem" }}>
              {c.description || "لا يوجد وصف متاح لهذه الحملة."}
            </p>

            {updates.length > 0 && (
              <>
                <h2 className="section-title" style={{ marginBottom: "1rem" }}>آخر التحديثات</h2>
                <ul className="timeline">
                  {updates.map((u, i) => (
                    <li key={i} className="timeline__item">
                      <div className="timeline__dot" />
                      <div style={{ fontSize: "0.68rem", color: "var(--muted-text)", marginBottom: 2 }}>{u.date ?? u.createdAt ?? ""}</div>
                      <div style={{ fontSize: "0.83rem", color: "var(--primary-text)" }}>{u.text ?? u.message ?? u.description}</div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="card" style={{ padding: "1.25rem" }}>
              <h3 style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--heading-text)", marginBottom: "1rem" }}>
                شارك في التبرع
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: "0.75rem" }}>
                {["50", "100", "250", "500", "1000"].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setDonateAmount(amt)}
                    className={`btn btn--sm${donateAmount === amt ? " btn--primary" : " btn--ghost"}`}
                  >
                    {amt} ج.م
                  </button>
                ))}
              </div>
              <div className="form-group" style={{ marginBottom: "0.75rem" }}>
                <div className="field-wrapper">
                  <input
                    type="number"
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(e.target.value)}
                    className="field-input"
                    placeholder="مبلغ آخر"
                    min={1}
                  />
                </div>
              </div>
              <button className="btn btn--primary btn--full btn--lg" onClick={handleDonate}>
                <FiHeart size={15} /> تبرع الآن
              </button>
            </div>

            <div className="card" style={{ padding: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>شارك الحملة</span>
                <button
                  className="btn btn--outline btn--sm"
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                  onClick={handleShare}
                >
                  <FiShare2 size={13} /> {shared ? "تم النسخ!" : "نسخ الرابط"}
                </button>
              </div>
            </div>

            <div className="card" style={{ padding: "1rem" }}>
              <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--heading-text)", marginBottom: 8 }}>المنظمة</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{c.organizationName || "منظمة شريكة"}</div>
                <span className="badge badge--green" style={{ marginTop: 3 }}><FiCheckCircle size={10} /> معتمدة</span>
              </div>
              {c.organizationId && (
                <button
                  className="btn btn--outline btn--sm btn--full"
                  style={{ marginTop: "0.75rem" }}
                  onClick={() => nav(`/organizations/${c.organizationId}`)}
                >
                  عرض المنظمة
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
