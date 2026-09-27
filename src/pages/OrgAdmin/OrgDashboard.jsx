import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiTarget,
  FiPackage,
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiAlertCircle,
  FiRefreshCw,
  FiArrowLeft,
  FiCreditCard,
  FiPlus,
  FiExternalLink
} from "react-icons/fi";
import DashboardLayout from "../../components/DashboardLayout";
import ProgressBar from "../../components/ProgressBar";
import { useAuth } from "../../context/AuthContext";
import {
  getOrganizationSoloCampaigns,
  getOrganizationSharedCampaigns,
  
} from "../../services/organizationApi";
import { getPaymentInfoByOrganization } from "../../services/paymentApi";
import { getDonationsByCampaign } from "../../services/donationApi";
import { normalizeCampaign } from "../../utils/normalize";

export default function OrgDashboard() {
  const navigate = useNavigate();
  const { currentOrg, orgId, isSuperAdmin, organizations, userOrganizations, setCurrentOrg, refreshOrg } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [totalDonations, setTotalDonations] = useState(0);
  const [donorCount, setDonorCount] = useState(0);

  const loadDashboardData = async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Fetch campaigns & payment info & item count in parallel
      const [soloRes, sharedRes,  paymentRes] = await Promise.allSettled([
        getOrganizationSoloCampaigns(orgId),
        getOrganizationSharedCampaigns(orgId),
        getPaymentInfoByOrganization(orgId),
      ]);

      const soloList = soloRes.status === "fulfilled" && Array.isArray(soloRes.value) ? soloRes.value : [];
      const sharedList = sharedRes.status === "fulfilled" && Array.isArray(sharedRes.value) ? sharedRes.value : [];
      
      const allCampaigns = [...soloList, ...sharedList]
        .map(normalizeCampaign)
        .filter(Boolean);

      setCampaigns(allCampaigns);

      

      if (paymentRes.status === "fulfilled" && paymentRes.value) {
        setPaymentConfig(paymentRes.value);
      } else {
        setPaymentConfig(null);
      }

      // 2. Fetch donations across campaigns to calculate total money & unique donors
      let collectedSum = 0;
      const uniqueDonors = new Set();

      // Sum collected directly from normalized campaign data first
      for (const camp of allCampaigns) {
        collectedSum += Number(camp.collectedMoney) || 0;
      }

      // Query campaign donations to get exact donor accounts
      try {
        const donationPromises = allCampaigns.slice(0, 10).map((c) =>
          getDonationsByCampaign(c.id).catch(() => [])
        );
        const donationResults = await Promise.all(donationPromises);
        donationResults.forEach((donList) => {
          const list = Array.isArray(donList) ? donList : donList?.data ?? [];
          list.forEach((d) => {
            if (d.userId) uniqueDonors.add(String(d.userId));
            if (d.amount && collectedSum === 0) collectedSum += Number(d.amount);
          });
        });
      } catch (err) {
        console.warn("Could not load full donation details:", err);
      }

      setTotalDonations(collectedSum);
      setDonorCount(uniqueDonors.size || allCampaigns.reduce((acc, c) => acc + (c.donors || 0), 0));
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError("تعذر تحميل بعض بيانات لوحة التحكم. يُرجى التحقق من اتصالك بالشبكة.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [orgId]);

  const activeCampaigns = useMemo(() => {
    return campaigns.filter(
      (c) => String(c.status).toLowerCase() === "active" || c.status === "نشطة" || !c.status
    );
  }, [campaigns]);

  const stats = [
    {
      label: "حملات نشطة",
      value: loading ? "..." : activeCampaigns.length.toLocaleString("ar-EG"),
      unit: `من إجمالي ${campaigns.length.toLocaleString("ar-EG")}`,
      icon: <FiTarget />,
      color: "#e8f5e9",
      iconColor: "#3f8747"
    },
    {
      label: "إجمالي التبرعات",
      value: loading ? "..." : totalDonations.toLocaleString("ar-EG"),
      unit: "ج.م",
      icon: <FiDollarSign />,
      color: "#fef9ec",
      iconColor: "#c9a570"
    },
    
    {
      label: "متبرعون",
      value: loading ? "..." : donorCount.toLocaleString("ar-EG"),
      unit: "متبرع مساهم",
      icon: <FiUsers />,
      color: "#fdecea",
      iconColor: "#b3413f"
    },
  ];

  return (
    <DashboardLayout role="org">
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--heading-text)" }}>
            لوحة تحكم المنظمة
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--muted-text)", marginTop: 4 }}>
            {currentOrg?.name || "منظمتك"} — {currentOrg?.address || "إدارة الحملات والتبرعات"}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {((isSuperAdmin ? organizations : (userOrganizations || [])).length > 1) && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem" }}>
              <span className="muted" style={{ fontWeight: 600 }}>إدارة منظمة:</span>
              <select
                className="field-select"
                style={{ fontSize: "0.78rem", padding: "4px 8px" }}
                value={orgId || ""}
                onChange={(e) => {
                  const targetList = isSuperAdmin ? organizations : (userOrganizations || []);
                  const found = targetList.find((o) => String(o.id) === e.target.value);
                  if (found) setCurrentOrg(found);
                }}
              >
                {(isSuperAdmin ? organizations : (userOrganizations || [])).map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            className="btn btn--outline btn--sm"
            onClick={() => { refreshOrg(); loadDashboardData(); }}
            title="تحديث البيانات"
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <FiRefreshCw size={13} className={loading ? "spin" : ""} />
            تحديث
          </button>
          
          <div className="badge badge--green">
            <FiTrendingUp size={11} /> متصل بالنظام
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert--error" style={{ marginBottom: "1.25rem" }}>
          {error}
        </div>
      )}

      {!orgId && !loading && (
        <div className="alert alert--info" style={{ marginBottom: "1.25rem" }}>
          لم يتم العثور على منظمة مقترنة بحسابك. يرجى التواصل مع المسؤول العام لربط حسابك بمنظمة.
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div className="stat-card__label">{s.label}</div>
              <div className="stat-card__icon" style={{ background: s.color, color: s.iconColor }}>{s.icon}</div>
            </div>
            <div className="stat-card__value">{s.value}</div>
            {s.unit && <div className="stat-card__sub">{s.unit}</div>}
          </div>
        ))}
      </div>

      {/* Campaigns overview & Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 280px", gap: "1rem" }}>
        {/* Campaigns card */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 className="section-title">أداء الحملات الحديثة</h2>
            <button
              className="btn btn--outline btn--sm"
              onClick={() => navigate("/org-admin/campaigns")}
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              إدارة الحملات <FiArrowLeft size={12} />
            </button>
          </div>

          {loading ? (
            <div className="muted" style={{ padding: "1.5rem", textAlign: "center" }}>
              جاري تحميل الحملات...
            </div>
          ) : campaigns.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted-text)" }}>
              <FiTarget size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p>لا توجد حملات مسجلة لهذه المنظمة حتى الآن.</p>
              <button
                className="btn btn--sm"
                style={{ marginTop: 10 }}
                onClick={() => navigate("/org-admin/campaigns?action=create")}
              >
                + إنشاء أول حملة
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {campaigns.slice(0, 4).map((c) => {
                const collected = Number(c.collectedMoney) || 0;
                const target = Number(c.targetMoney) || 1;
                const daysLeft = c.daysLeft ?? (c.deadline ? Math.ceil((new Date(c.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null);

                return (
                  <div key={c.id} style={{ padding: "0.85rem", background: "var(--bg-soft)", borderRadius: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{c.title}</span>
                      {daysLeft !== null && (
                        <span
                          style={{
                            fontSize: "0.72rem",
                            color: daysLeft <= 7 ? "var(--error)" : "var(--muted-text)",
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                            fontWeight: daysLeft <= 7 ? 700 : 500
                          }}
                        >
                          {daysLeft <= 7 && <FiAlertCircle size={11} />}
                          {daysLeft > 0 ? `${daysLeft} يوم متبقٍ` : "منتهية"}
                        </span>
                      )}
                    </div>
                    <ProgressBar value={collected} max={target} label />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Side columns: Quick actions & Payment info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Quick actions card */}
          <div className="card" style={{ padding: "1.1rem" }}>
            <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--heading-text)", marginBottom: "0.85rem" }}>
              إجراءات سريعة
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                className="btn btn--outline btn--sm"
                style={{ textAlign: "right", justifyContent: "flex-start", display: "flex", alignItems: "center", gap: 6 }}
                onClick={() => navigate("/org-admin/campaigns?action=create")}
              >
                <FiPlus size={13} color="var(--brand-green)" />
                إنشاء حملة جديدة
              </button>

              <button
                className="btn btn--outline btn--sm"
                style={{ textAlign: "right", justifyContent: "flex-start", display: "flex", alignItems: "center", gap: 6 }}
                onClick={() => navigate("/org-admin/donations")}
              >
                <FiDollarSign size={13} color="var(--brand-green)" />
                عرض سجل التبرعات
              </button>

              <button
                className="btn btn--outline btn--sm"
                style={{ textAlign: "right", justifyContent: "flex-start", display: "flex", alignItems: "center", gap: 6 }}
                onClick={() => navigate("/org-admin/settings")}
              >
                <FiExternalLink size={13} color="var(--brand-green)" />
                إعدادات المنظمة ووسائل التواصل
              </button>
            </div>
          </div>

          {/* Payment gateway card */}
          <div className="card" style={{ padding: "1.1rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
              <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--heading-text)", display: "flex", alignItems: "center", gap: 6 }}>
                <FiCreditCard size={15} /> حالة بوابة الدفع
              </div>
              {paymentConfig ? (
                <span className="badge badge--green" style={{ fontSize: "0.72rem" }}>مفعّل ✓</span>
              ) : (
                <span className="badge badge--red" style={{ fontSize: "0.72rem" }}>غير مفعّل</span>
              )}
            </div>

            {paymentConfig ? (
              <div>
                <p style={{ fontSize: "0.75rem", color: "var(--muted-text)", lineHeight: 1.5 }}>
                  بوابة Paymob مربوطة بحساب منظمتك بنجاح. Integration ID: <strong>{paymentConfig.integrationId || "نشط"}</strong>
                </p>
                <button
                  className="btn btn--ghost btn--sm"
                  style={{ marginTop: 8, fontSize: "0.75rem", padding: "4px 8px" }}
                  onClick={() => navigate("/org-admin/settings?tab=payment")}
                >
                  تعديل مفاتيح الدفع ←
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: "0.75rem", color: "var(--muted-text)", lineHeight: 1.5 }}>
                  لم يتم إعداد مفاتيح Paymob لهذه المنظمة بعد. لا يمكن استقبال التبرعات الإلكترونية حتى يتم تفعيلها.
                </p>
                <button
                  className="btn btn--sm"
                  style={{ marginTop: 8, fontSize: "0.75rem", width: "100%" }}
                  onClick={() => navigate("/org-admin/settings?tab=payment")}
                >
                  ربط بوابة الدفع الآن
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
