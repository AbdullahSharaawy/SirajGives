import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiArrowRight, FiPhone, FiMail, FiMapPin, FiCheckCircle, FiGlobe } from "react-icons/fi";
import PageLayout from "../../components/PageLayout";
import CampaignCard, { Campaign } from "../../components/CampaignCard";
import { getOrganization, getOrganizationCampaigns, getOrganizationContacts } from "../../services/organizationApi";
import { asArray, normalizeCampaign, normalizeOrganization } from "../../utils/normalize";

const contactIcon = (type: string) => {
  const value = String(type || "").toLowerCase();
  if (value.includes("mail") || value.includes("بريد")) return <FiMail size={13} />;
  if (value.includes("web") || value.includes("موقع")) return <FiGlobe size={13} />;
  if (value.includes("address") || value.includes("عنوان")) return <FiMapPin size={13} />;
  return <FiPhone size={13} />;
};

export default function OrgDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const [org, setOrg] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.allSettled([
      getOrganization(id),
      getOrganizationCampaigns(id),
      getOrganizationContacts(id),
    ]).then(([orgResult, campaignResult, contactResult]) => {
      console.log(orgResult);
      if (orgResult.status === "fulfilled") setOrg(normalizeOrganization(orgResult.value));
      else setError("تعذر تحميل بيانات المنظمة.");
      if (campaignResult.status === "fulfilled") {
        setCampaigns(asArray(campaignResult.value).map(normalizeCampaign).filter(Boolean) as Campaign[]);
      }
      if (contactResult.status === "fulfilled") setContacts(asArray(contactResult.value));
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <PageLayout><div className="page-container" style={{ padding: "2rem 1.25rem" }}>جاري تحميل المنظمة...</div></PageLayout>;
  }

  if (!org) {
    return (
      <PageLayout>
        <div className="page-container" style={{ padding: "2rem 1.25rem" }}>
          <div className="alert alert--error">{error || "المنظمة غير موجودة."}</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div style={{ height: 160, background: "var(--bg-soft)" }} />

      <div className="page-container" style={{ padding: "0 1.25rem 2rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", marginTop: "-36px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <div className="org-avatar" style={{ width: 72, height: 72, border: "3px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", flexShrink: 0 }}>
            {org.imageUrl ? <img src={org.imageUrl} alt={org.name} /> : (org.name ?? "م").charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--heading-text)" }}>{org.name}</h1>
              {org.verified && <span className="badge badge--green"><FiCheckCircle size={10} /> معتمدة</span>}
            </div>
            {org.address && (
              <div style={{ fontSize: "0.75rem", color: "var(--muted-text)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                <FiMapPin size={11} /> {org.address}
              </div>
            )}
          </div>
          <button className="btn btn--ghost btn--sm" style={{ display: "flex", alignItems: "center", gap: 5 }} onClick={() => nav("/organizations")}>
            <FiArrowRight size={13} /> رجوع
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "1.5rem" }}>
          <div>
            <h2 className="section-title" style={{ marginBottom: "0.75rem" }}>عن المنظمة</h2>
            <p style={{ fontSize: "0.88rem", lineHeight: 1.8, color: "var(--primary-text)", marginBottom: "1.75rem" }}>{org.description || "لا توجد نبذة تعريفية متاحة."}</p>

            <h2 className="section-title" style={{ marginBottom: "1rem" }}>الحملات النشطة</h2>
            {campaigns.length ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
                {campaigns.map((c) => <CampaignCard key={c.id} c={c} />)}
              </div>
            ) : (
              <p className="muted">لا توجد حملات لهذه المنظمة حالياً.</p>
            )}
          </div>

          <div>
            <div className="card" style={{ padding: "1rem", marginBottom: "1rem" }}>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--heading-text)", marginBottom: "0.85rem" }}>معلومات التواصل</div>
              {contacts.length ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {contacts.map((c: any) => {
                    const value = c.value ?? c.contactValue ?? c.url ?? c.email ?? c.phone ?? "";
                    return (
                      <div key={c.id ?? value} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem", color: "var(--primary-text)" }}>
                        <span style={{ color: "var(--accent-green)" }}>{contactIcon(c.type ?? c.contactType)}</span>
                        {value}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="muted" style={{ fontSize: "0.78rem" }}>لا توجد بيانات تواصل.</p>
              )}
            </div>
            <div className="card" style={{ padding: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem", textAlign: "center" }}>
                <div style={{ padding: "0.75rem 0.5rem", background: "var(--bg-soft)", borderRadius: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--heading-text)" }}>{campaigns.length}</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--muted-text)" }}>حملة</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
