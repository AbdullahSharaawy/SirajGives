import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiCheckCircle } from "react-icons/fi";
import PageLayout from "../../components/PageLayout";
import { getOrganizations } from "../../services/organizationApi";
import { asArray, normalizeOrganization } from "../../utils/normalize";

export default function Organizations() {
  const nav = useNavigate();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "verified">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrganizations({ includeDeleted: false })
      .then((items) => {
        setOrganizations(asArray(items).map(normalizeOrganization).filter(Boolean));
      })
      .catch(() => setError("تعذر تحميل المنظمات."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = organizations.filter((o) => {
    const haystack = `${o.name} ${o.address}`.toLowerCase();
    const matchSearch = haystack.includes(search.toLowerCase());
    const matchVerified = filter === "verified" ? o.verified : true;
    return matchSearch && matchVerified;
  });

  return (
    <PageLayout>
      <div className="page-header">
        <div className="page-container">
          <h1 className="page-title" style={{ marginBottom: "0.5rem" }}>المنظمات الشريكة</h1>
          <p style={{ color: "var(--muted-text)", fontSize: "0.85rem" }}>منظمات معتمدة تعمل على خدمة المجتمع</p>
        </div>
      </div>

      <div className="page-container" style={{ padding: "1.5rem 1.25rem" }}>
        {error && <div className="alert alert--error" style={{ marginBottom: "1rem" }}>{error}</div>}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث باسم المنظمة أو الموقع..." />
            <button type="button"><FiSearch size={14} /></button>
          </div>
          <div className="tabs" style={{ marginBottom: 0, border: "none" }}>
            <button className={`tab${filter === "all" ? " tab--active" : ""}`} onClick={() => setFilter("all")}>الكل</button>
            <button className={`tab${filter === "verified" ? " tab--active" : ""}`} onClick={() => setFilter("verified")}>معتمدة فقط</button>
          </div>
        </div>

        {loading ? <p>جاري تحميل المنظمات...</p> : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <div className="empty-state__text">لا توجد منظمات مطابقة للبحث</div>
          </div>
        ) : (
          <div className="responsive-orgs-grid">
            {filtered.map((o) => (
              <div key={o.id} className="card" style={{ padding: "1.1rem", cursor: "pointer", transition: "box-shadow 0.15s" }} onClick={() => nav(`/organizations/${o.id}`)}>
                <div style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
                  <div className="org-avatar">
                    {o.imageUrl ? <img src={o.imageUrl} alt={o.name} /> : (o.name ?? "م").charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--heading-text)" }}>{o.name}</span>
                      {o.verified && <span className="badge badge--green"><FiCheckCircle size={9} /> معتمدة</span>}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--muted-text)", marginTop: 2 }}>{o.address}</div>
                  </div>
                </div>
                {o.desc && <p style={{ fontSize: "0.78rem", color: "var(--muted-text)", marginTop: "0.75rem", lineHeight: 1.6 }}>{o.desc}</p>}
                <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--muted-text)" }}>{o.campaigns} حملة نشطة</span>
                  <button className="btn btn--outline btn--sm">عرض الملف</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
