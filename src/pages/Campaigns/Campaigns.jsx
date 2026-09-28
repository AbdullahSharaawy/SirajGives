import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import PageLayout from "../../components/PageLayout";
import CampaignCard from "../../components/CampaignCard";
import { getCampaigns } from "../../services/campaignApi";
import { normalizeCampaign } from "../../utils/normalize";

const TABS = ["الكل", "فردية", "مشتركة"];

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [tab, setTab] = useState("الكل");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCampaigns({ includeDeleted: false })
      .then((items) => {
        setCampaigns(items.map(normalizeCampaign).filter(Boolean) );
      })
      .catch(() => setError("تعذر تحميل الحملات."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = campaigns.filter((c) => {
    const haystack = `${c.title} ${c.organizationName ?? ""}`.toLowerCase();
    const matchSearch = haystack.includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (tab === "الكل") return true;
    if (tab === "فردية") return c.isSolo;
    if (tab === "مشتركة") return !c.isSolo;
    return true;
  });

  return (
    <PageLayout>
      <div className="page-header">
        <div className="page-container">
          <h1 className="page-title" style={{ marginBottom: "0.5rem" }}>الحملات الخيرية</h1>
          <p style={{ color: "var(--muted-text)", fontSize: "0.85rem" }}>
            اختر الحملة التي تناسبك وشارك في صنع الفارق
          </p>
        </div>
      </div>

      <div className="page-container" style={{ padding: "1.5rem 1.25rem" }}>
        {error && <div className="alert alert--error" style={{ marginBottom: "1rem" }}>{error}</div>}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن حملة أو منظمة..."
            />
            <button type="button"><FiSearch size={14} /></button>
          </div>
        </div>

        <div className="tabs">
          {TABS.map((t) => (
            <button key={t} className={`tab${tab === t ? " tab--active" : ""}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <p>جاري تحميل الحملات...</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <div className="empty-state__text">لا توجد حملات مطابقة للبحث</div>
          </div>
        ) : (
          <div className="responsive-cards-grid">
            {filtered.map((c) => <CampaignCard key={c.id} c={c} />)}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
