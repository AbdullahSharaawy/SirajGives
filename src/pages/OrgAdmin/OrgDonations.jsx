import { useState, useEffect, useMemo } from "react";
import {
  FiDollarSign,
  FiTrendingUp,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiDownload,
  FiUsers,
  FiHeart
} from "react-icons/fi";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import {
  getOrganizationSoloCampaigns,
  getOrganizationSharedCampaigns,
} from "../../services/organizationApi";
import {
  getDonationsByCampaign,
  getCampaignDonors,
} from "../../services/donationApi";
import { normalizeCampaign } from "../../utils/normalize";



export default function OrgDonations() {
  const { orgId, currentOrg } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [campaignTotals, setCampaignTotals] = useState([]);
  const [donations, setDonations] = useState([]);

  const [search, setSearch] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("all");

  const loadDonationsData = async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Fetch campaigns for this organization
      const [soloRes, sharedRes] = await Promise.allSettled([
        getOrganizationSoloCampaigns(orgId),
        getOrganizationSharedCampaigns(orgId),
      ]);

      const soloList = soloRes.status === "fulfilled" && Array.isArray(soloRes.value) ? soloRes.value : [];
      const sharedList = sharedRes.status === "fulfilled" && Array.isArray(sharedRes.value) ? sharedRes.value : [];

      const allCampaigns = [...soloList, ...sharedList]
        .map(normalizeCampaign)
        .filter(Boolean);

      const totals = [];
      const allRecords = [];

      // 2. Fetch donations & donors for each campaign
      await Promise.all(
        allCampaigns.map(async (camp) => {
          let campaignDonationsList = [];
          let donorsList = [];

          try {
            const [donRes, donorRes] = await Promise.allSettled([
              getDonationsByCampaign(camp.id),
              getCampaignDonors(camp.id),
            ]);

            if (donRes.status === "fulfilled") {
              const resVal = donRes.value;
              campaignDonationsList = Array.isArray(resVal) ? resVal : resVal?.data ?? [];
            }

            if (donorRes.status === "fulfilled") {
              const resVal = donorRes.value;
              donorsList = Array.isArray(resVal) ? resVal : resVal?.data ?? [];
            }
          } catch (e) {
            console.warn(`Could not load donations for campaign ${camp.id}:`, e);
          }

          // Calculate total raised for this campaign
          let campSum = 0;
          campaignDonationsList.forEach((d) => {
            const amt = Number(d.amount) || 0;
            campSum += amt;
            allRecords.push({
              id: d.id || `${camp.id}-${Math.random()}`,
              donorName: d.userName || d.userFullName || d.userId || (d.donor ? d.donor.name : "متبرع كريم"),
              campaignTitle: camp.title || "حملة خيرية",
              campaignId: camp.id,
              amount: amt,
              date: d.registrationDate || d.createdOn || d.date || new Date().toISOString(),
              status: d.isDeleted ? "ملغي" : "مكتمل",
            });
          });

          // If no individual donation records yet, fallback to campaign.collectedMoney
          const displayTotal = campSum > 0 ? campSum : Number(camp.collectedMoney) || 0;
          const displayDonors = donorsList.length > 0 ? donorsList.length : Number(camp.donors) || 0;

          totals.push({
            campaignId: camp.id,
            campaignTitle: camp.title,
            total: displayTotal,
            donorsCount: displayDonors,
          });
        })
      );

      // Sort donations descending by date
      allRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setCampaignTotals(totals);
      setDonations(allRecords);
    } catch (err) {
      console.error("Failed to load donations data:", err);
      setError("تعذر تحميل سجل التبرعات. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonationsData();
  }, [orgId]);

  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      const matchSearch =
        d.donorName.toLowerCase().includes(search.toLowerCase()) ||
        d.campaignTitle.toLowerCase().includes(search.toLowerCase());

      const matchCampaign =
        campaignFilter === "all" || String(d.campaignId) === campaignFilter;

      return matchSearch && matchCampaign;
    });
  }, [donations, search, campaignFilter]);

  const totalCollected = useMemo(() => {
    return campaignTotals.reduce((sum, c) => sum + c.total, 0);
  }, [campaignTotals]);

  const totalDonors = useMemo(() => {
    return campaignTotals.reduce((sum, c) => sum + c.donorsCount, 0);
  }, [campaignTotals]);

  return (
    <DashboardLayout role="org">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--heading-text)" }}>
            سجل التبرعات المالية
          </h1>
          <p style={{ fontSize: "0.8rem", color: "var(--muted-text)", marginTop: 3 }}>
            منظمة: {currentOrg?.name || "منظمتك"} — متابعة جميع المعاملات المالية المباشرة
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn--outline btn--sm"
            onClick={loadDonationsData}
            title="تحديث البيانات"
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <FiRefreshCw size={13} className={loading ? "spin" : ""} />
            تحديث
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert--error" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {/* Overview Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div className="stat-card__label">إجمالي التبرعات المجمعة</div>
            <div className="stat-card__icon" style={{ background: "#e8f5e9", color: "#3f8747" }}><FiDollarSign /></div>
          </div>
          <div className="stat-card__value">{loading ? "..." : totalCollected.toLocaleString("ar-EG")}</div>
          <div className="stat-card__sub">جنيه مصري</div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div className="stat-card__label">إجمالي المتبرعين المساهمين</div>
            <div className="stat-card__icon" style={{ background: "#fdecea", color: "#b3413f" }}><FiUsers /></div>
          </div>
          <div className="stat-card__value">{loading ? "..." : totalDonors.toLocaleString("ar-EG")}</div>
          <div className="stat-card__sub">مساهم في حملاتك</div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div className="stat-card__label">حملات تلقت تبرعات</div>
            <div className="stat-card__icon" style={{ background: "#e8f0fe", color: "#3b6ac3" }}><FiHeart /></div>
          </div>
          <div className="stat-card__value">{loading ? "..." : campaignTotals.filter(c => c.total > 0).length}</div>
          <div className="stat-card__sub">من أصل {campaignTotals.length} حملة</div>
        </div>
      </div>

      {/* Campaign Totals Cards */}
      {campaignTotals.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--heading-text)", marginBottom: "0.75rem" }}>
            إجمالي التبرعات حسب الحملة
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            {campaignTotals.map((t) => (
              <div key={t.campaignId} className="card" style={{ padding: "1rem" }}>
                <div style={{ fontSize: "0.78rem", color: "var(--muted-text)", fontWeight: 700, marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={t.campaignTitle}>
                  {t.campaignTitle}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <FiDollarSign size={16} color="var(--brand-green)" />
                  <span style={{ fontWeight: 800, fontSize: "1.15rem", color: "var(--heading-text)" }}>
                    {t.total.toLocaleString("ar-EG")}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--muted-text)" }}>ج.م</span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--muted-text)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <FiTrendingUp size={11} /> {t.donorsCount} متبرع
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions Table & Filters */}
      <div className="card">
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
            سجل العمليات التفصيلية ({filteredDonations.length})
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            {/* Campaign dropdown selector */}
            <select
              className="field-select"
              style={{ fontSize: "0.78rem", padding: "4px 8px" }}
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
            >
              <option value="all">كل الحملات</option>
              {campaignTotals.map((c) => (
                <option key={c.campaignId} value={String(c.campaignId)}>
                  {c.campaignTitle}
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="search-bar" style={{ width: 200, marginBottom: 0 }}>
              <input
                style={{ fontSize: "0.78rem", padding: "4px 8px" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بالمتبرع..."
              />
              <button><FiSearch size={12} /></button>
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>المتبرع</th>
                <th>الحملة</th>
                <th>المبلغ</th>
                <th>تاريخ التبرع</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }} className="muted">
                    جاري تحميل التبرعات...
                  </td>
                </tr>
              ) : filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "2.5rem" }} className="muted">
                    <FiDollarSign size={28} style={{ opacity: 0.3, marginBottom: 6, display: "block", margin: "0 auto" }} />
                    لا توجد عمليات تبرع مسجلة حالياً.
                  </td>
                </tr>
              ) : (
                filteredDonations.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>{d.donorName}</td>
                    <td className="muted" style={{ maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={d.campaignTitle}>
                      {d.campaignTitle}
                    </td>
                    <td style={{ color: "var(--brand-green)", fontWeight: 700 }}>
                      {d.amount.toLocaleString("ar-EG")} ج.م
                    </td>
                    <td className="muted" style={{ fontSize: "0.78rem" }}>
                      {d.date ? new Date(d.date).toLocaleString("ar-EG") : "—"}
                    </td>
                    <td>
                      <span className={`badge ${d.status === "مكتمل" ? "badge--green" : "badge--gray"}`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
