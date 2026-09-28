import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiHeart, FiUsers, FiTarget, FiTrendingUp } from "react-icons/fi";
import PageLayout from "../../components/PageLayout";
import CampaignCard from "../../components/CampaignCard";
import { getHomeData } from "../../services/adminApi";
import { useAuth } from "../../context/AuthContext";
import { normalizeCampaign, normalizeOrganization, numberValue } from "../../utils/normalize";

const formatNumber = (value) => numberValue(value).toLocaleString("ar-EG");

export default function Home() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const { login,loading: authLoading } = useAuth();
  const [data, setData] = useState({ trendingCampaigns: [], urgentCampaigns: [], organizations: [], campaignStats: {}, totalDonations: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      login(token).then((authInfo) => {
        if (authInfo?.isOrgAdmin && !authInfo?.isSuperAdmin) {
          nav("/org-admin", { replace: true });
        } else {
          nav(window.location.pathname, { replace: true });
        }
      });
    }
  }, [login, nav, searchParams]);

  

  useEffect(() => {
    getHomeData()
      .then((homeData) => {
        console.log(homeData);
        setData(homeData);
        if (homeData.hasErrors) setError("تعذر تحميل بعض بيانات الصفحة.");
      })
      .catch(() => setError("تعذر تحميل بيانات الصفحة."))
      .finally(() => setLoading(false));
  }, []);

  const trendingCampaigns = data.trendingCampaigns.map(normalizeCampaign).filter(Boolean);
  const urgentCampaigns = data.urgentCampaigns.map(normalizeCampaign).filter(Boolean) ;
  const organizations = data.organizations.map(normalizeOrganization).filter(Boolean);
  const campaignStats = data.campaignStats || {};
  const stats = [
    { icon: <FiHeart />, label: "إجمالي التبرعات", value: formatNumber(data.totalDonations ?? campaignStats.totalMoney), color: "#fdecea", iconColor: "#b3413f" },
    { icon: <FiTarget />, label: "حملات نشطة", value: formatNumber(campaignStats.activeCount ?? campaignStats.activeCampaigns), color: "#e8f5e9", iconColor: "#3f8747" },
    { icon: <FiUsers />, label: "إجمالي الحملات", value: formatNumber(campaignStats.totalCount ?? campaignStats.totalCampaigns), color: "#fef9ec", iconColor: "#c9a570" },
    { icon: <FiTrendingUp />, label: "منظمات شريكة", value: formatNumber(organizations.length), color: "#e8f0fe", iconColor: "#3b6ac3" },
  ];

  return (
    <PageLayout>
      {error && <div className="page-container alert alert--error" style={{ marginTop: "1rem" }}>{error}</div>}
      {/* Hero */}
      <section className="hero">
        <div className="page-container hero__inner">
          <div style={{ maxWidth: 560 }}>
            <span className="badge badge--gold" style={{ marginBottom: 16, display: "inline-flex" }}>
              منصة العطاء والخير
            </span>
            <h1 style={{ fontSize: "clamp(1.75rem, 5vw, 2.4rem)", fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: "1rem" }}>
              كن جزءاً من التغيير،<br />تبرّع الآن
            </h1>
            <p style={{ fontSize: "clamp(0.88rem, 2vw, 1rem)", color: "rgba(255,255,255,0.85)", lineHeight: 1.7, marginBottom: "1.75rem" }}>
              سِراج منصة خيرية تجمع المتبرعين بالمنظمات والحملات الإنسانية،
              لنصنع معاً فرقاً حقيقياً في حياة المحتاجين.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button className="btn btn--gold btn--lg" onClick={() => nav("/campaigns")}>
                تصفح الحملات
              </button>
              <button
                className="btn btn--lg"
                style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}
                onClick={() => nav("/organizations")}
              >
                تعرف على المنظمات
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: "#fff", borderBottom: "1px solid var(--border)", padding: "1.75rem 0" }}>
        <div className="page-container">
          <div className="responsive-stats-grid">
            {stats.map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", color: s.iconColor, flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--heading-text)" }}>{s.value}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--muted-text)", fontWeight: 600 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending campaigns */}
      <section className="section">
        <div className="page-container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FiTrendingUp color="var(--accent-green)" size={18} /> الحملات الأكثر تفاعلاً
            </h2>
            <button className="btn btn--outline btn--sm" onClick={() => nav("/campaigns")} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              عرض الكل <FiArrowLeft size={13} />
            </button>
          </div>
          <div className="responsive-cards-grid">
            {loading ? <p>جاري تحميل الحملات...</p> : trendingCampaigns.length ? trendingCampaigns.map((c) => <CampaignCard key={c.id} c={c} />) : <p>لا توجد حملات متاحة حالياً.</p>}
          </div>
        </div>
      </section>

      {/* Urgent campaigns */}
      <section className="section section--alt">
        <div className="page-container">
          <h2 className="section-title" style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 8 }}>
            <FiHeart color="var(--error)" size={18} /> حملات عاجلة — تنتهي قريباً
          </h2>
          <div className="responsive-cards-grid">
            {loading ? <p>جاري تحميل الحملات...</p> : urgentCampaigns.length ? urgentCampaigns.map((c) => (
              <CampaignCard key={c.id} c={c} />
            )) : <p>لا توجد حملات عاجلة حالياً.</p>}
          </div>
        </div>
      </section>

      {/* Featured orgs */}
      <section className="section">
        <div className="page-container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <h2 className="section-title">منظمات شريكة مميزة</h2>
            <button className="btn btn--outline btn--sm" onClick={() => nav("/organizations")}>
              كل المنظمات
            </button>
          </div>
          <div className="responsive-orgs-grid">
            {loading ? <p>جاري تحميل المنظمات...</p> : organizations.length ? organizations.map((o) => (
              <div key={o.id} className="org-card" onClick={() => nav(`/organizations/${o.id}`)}>
                <div className="org-avatar">
                  {o.imageUrl ? <img src={o.imageUrl} alt={o.name} /> : (o.name ?? "م").charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--heading-text)" }}>{o.name}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--muted-text)", marginTop: 2 }}>{o.campaigns ?? 0} حملة نشطة</div>
                  <span className="badge badge--green" style={{ marginTop: 6 }}>معتمدة ✓</span>
                </div>
              </div>
            )) : <p>لا توجد منظمات متاحة حالياً.</p>}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section style={{ background: "linear-gradient(135deg, var(--brand-gold) 0%, #b8924e 100%)", padding: "3rem 0", textAlign: "center" }}>
        <div className="page-container">
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", marginBottom: "0.75rem" }}>
            هل أنت صاحب منظمة خيرية؟
          </h2>
          <p style={{ color: "rgba(255,255,255,0.88)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
            انضم إلى سِراج وابدأ في إطلاق حملاتك الخيرية اليوم
          </p>
          <button className="btn btn--lg" style={{ background: "#fff", color: "var(--brand-gold)", fontWeight: 800 }}>
            تواصل معنا
          </button>
        </div>
      </section>
    </PageLayout>
  );
}
