import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FiPlus,
  FiTrash2,
  FiShield,
  FiUserPlus,
  FiCheckCircle,
  FiAlertCircle,
  FiPhone,
  FiMail,
  FiGlobe,
  FiSmartphone,
  FiUser,
  FiX,
  FiRefreshCw
} from "react-icons/fi";
import DashboardLayout from "../../components/DashboardLayout";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import {
  getOrganization,
  getOrganizationContacts,
  addOrgContactMethod,
  deleteOrgContactMethod,
  getSubAdmins,
  addSubAdmin,
  removeSubAdmin,
} from "../../services/organizationApi";
import {
  getPaymentInfoByOrganization,
  createPaymentInfo,
  updatePaymentInfo,
  deletePaymentInfo,
} from "../../services/paymentApi";
import { getUsers } from "../../services/adminApi";



const CONTACT_TYPES = [
  { value: "Phone", label: "هاتف", icon: <FiPhone size={13} /> },
  { value: "Mobile", label: "موبايل", icon: <FiSmartphone size={13} /> },
  { value: "Email", label: "بريد إلكتروني", icon: <FiMail size={13} /> },
  { value: "Website", label: "موقع إلكتروني", icon: <FiGlobe size={13} /> },
  { value: "SocialMedia", label: "شبكات تواصل", icon: <FiGlobe size={13} /> },
  { value: "Fax", label: "فاكس", icon: <FiPhone size={13} /> },
];

export default function OrgSettings() {
  const { orgId, currentOrg, refreshOrg, isSuperAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = (searchParams.get("tab")) || "contacts";
  const [tab, setTab] = useState(initialTab);

  // Status feedback
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // Tab 1: Profile State
  const [orgName, setOrgName] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [orgDesc, setOrgDesc] = useState("");

  // Tab 2: Contacts State
  const [contacts, setContacts] = useState([]);
  const [newContactType, setNewContactType] = useState("Phone");
  const [newContactValue, setNewContactValue] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);

  // Tab 3: Payment State
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [integrationId, setIntegrationId] = useState("");
  const [iframeId, setIframeId] = useState("");
  const [hmacKey, setHmacKey] = useState("");

  // Tab 4: Sub-admins State
  const [subAdmins, setSubAdmins] = useState([]);
  const [showAddSubAdminModal, setShowAddSubAdminModal] = useState(false);
  const [subAdminUserName, setSubAdminUserName] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Sync tab with URL
  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSearchParams({ tab: newTab });
    setError("");
    setMsg("");
  };

  // 1. Initialize Profile data
  useEffect(() => {
    if (currentOrg) {
      setOrgName(currentOrg.name || "");
      setOrgAddress(currentOrg.address || "");
      setOrgDesc(currentOrg.description || "");
    }
  }, [currentOrg]);

  // 2. Load tab specific data
  const loadTabData = async () => {
    if (!orgId) return;
    setLoading(true);
    setError("");

    try {
      if (tab === "profile") {
        const details = await getOrganization(orgId);
        if (details) {
          setOrgName(details.name || "");
          setOrgAddress(details.address || "");
          setOrgDesc(details.description || "");
        }
      } else if (tab === "contacts") {
        const res = await getOrganizationContacts(orgId);
        const list = Array.isArray(res) ? res : res?.items || res?.data || [];
        setContacts(list);
      } else if (tab === "payment") {
        try {
          const res = await getPaymentInfoByOrganization(orgId);
          const info = res?.data ?? res;
          if (info && info.id) {
            setPaymentInfo(info);
            setApiKey(info.apiKey || "");
            setIntegrationId(info.integrationId || "");
            setIframeId(info.iframeId || "");
            setHmacKey(info.hmacKey || "");
          } else {
            setPaymentInfo(null);
            setApiKey("");
            setIntegrationId("");
            setIframeId("");
            setHmacKey("");
          }
        } catch {
          setPaymentInfo(null);
        }
      } else if (tab === "subadmins") {
        const res = await getSubAdmins(orgId);
        const list = Array.isArray(res) ? res : res?.items || res?.data || [];
        setSubAdmins(list);
      }
    } catch (err) {
      console.error("Tab data loading error:", err);
      setError("تعذر تحميل البيانات المطلوبة من الخادم.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTabData();
  }, [tab, orgId]);

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!orgId) return;

    setSaving(true);
    setError("");
    setMsg("");

    try {
      await updateOrganization(orgId, {
        name: orgName.trim(),
        address: orgAddress.trim(),
        description: orgDesc.trim(),
      });
      await refreshOrg(orgId);
      setMsg("تم تحديث بيانات المنظمة بنجاح.");
      setTimeout(() => setMsg(""), 3500);
    } catch (err) {
      console.error("Profile update error:", err);
      if (err?.response?.status === 403) {
        setError("تعديل بيانات المنظمة يتطلب صلاحية المشرف العام أو المسؤول المفوض.");
      } else {
        setError(err?.response?.data?.message || "تعذر حفظ بيانات المنظمة.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle Add Contact Method
  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!orgId || !newContactValue.trim()) return;

    setSaving(true);
    setError("");

    try {
      await addOrgContactMethod(orgId, {
        value: newContactValue.trim(),
        type: newContactType,
        companyId: Number(orgId),
      });

      setNewContactValue("");
      setShowAddContact(false);
      setMsg("تمت إضافة وسيلة التواصل بنجاح.");
      setTimeout(() => setMsg(""), 3000);
      await loadTabData();
    } catch (err) {
      console.error("Add contact error:", err);
      setError(err?.response?.data?.message || "تعذر إضافة وسيلة التواصل.");
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete Contact Method
  const handleDeleteContact = async (contactId) => {
    if (!orgId || !window.confirm("هل أنت متأكد من حذف وسيلة التواصل هذه؟")) return;

    try {
      await deleteOrgContactMethod(orgId, contactId);
      setMsg("تم حذف وسيلة التواصل.");
      setTimeout(() => setMsg(""), 3000);
      await loadTabData();
    } catch (err) {
      console.error("Delete contact error:", err);
      setError("تعذر حذف وسيلة التواصل.");
    }
  };

  // Handle Save Payment Info
  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!orgId) return;

    if (!apiKey.trim() || !integrationId.trim() || !iframeId.trim() || !hmacKey.trim()) {
      setError("جميع حقول بوابة الدفع Paymob مطلوبة.");
      return;
    }

    setSaving(true);
    setError("");
    setMsg("");

    const payload = {
      apiKey: apiKey.trim(),
      integrationId: integrationId.trim(),
      iframeId: iframeId.trim(),
      hmacKey: hmacKey.trim(),
      organizationId: Number(orgId),
    };

    try {
      if (paymentInfo && paymentInfo.id) {
        await updatePaymentInfo(paymentInfo.id, payload);
        setMsg("تم تحديث مفاتيح بوابة Paymob بنجاح.");
      } else {
        await createPaymentInfo(payload);
        setMsg("تم ربط بوابة Paymob بمنظمتك بنجاح.");
      }
      setTimeout(() => setMsg(""), 3500);
      await loadTabData();
    } catch (err) {
      console.error("Save payment error:", err);
      setError(err?.response?.data?.message || "تعذر حفظ إعدادات الدفع.");
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete Payment Info
  const handleDeletePayment = async () => {
    if (!paymentInfo?.id || !window.confirm("هل أنت متأكد من إزالة مفاتيح الدفع؟ لن تتمكن المنظمة من استقبال التبرعات الإلكترونية.")) return;

    setSaving(true);
    try {
      await deletePaymentInfo(paymentInfo.id);
      setPaymentInfo(null);
      setApiKey("");
      setIntegrationId("");
      setIframeId("");
      setHmacKey("");
      setMsg("تمت إزالة مفاتيح بوابة الدفع.");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      console.error("Delete payment error:", err);
      setError("تعذر حذف مفاتيح الدفع.");
    } finally {
      setSaving(false);
    }
  };

  // Open Add Sub-Admin Modal
  const openAddSubAdminModal = async () => {
    setShowAddSubAdminModal(true);
    setSubAdminUserName("");
    setLoadingUsers(true);
    try {
      const usersList = await getUsers(false);
      setAvailableUsers(Array.isArray(usersList) ? usersList : []);
    } catch (e) {
      console.warn("Could not load users list for picker:", e);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Handle Add Sub-Admin
  const handleAddSubAdmin = async (e) => {
    e.preventDefault();
    if (!orgId || !subAdminUserName.trim()) return;

    setSaving(true);
    setError("");

    try {
      await addSubAdmin(orgId, subAdminUserName.trim());
      setShowAddSubAdminModal(false);
      setMsg("تمت إضافة المساعد الإداري بنجاح.");
      setTimeout(() => setMsg(""), 3500);
      await loadTabData();
    } catch (err) {
      console.error("Add sub-admin error:", err);
      setError(err?.response?.data?.message || "تعذر إضافة المساعد الإداري. تأكد من صحة معرف المستخدم.");
    } finally {
      setSaving(false);
    }
  };

  // Handle Remove Sub-Admin
  const handleRemoveSubAdmin = async (userId) => {
    if (!orgId || !window.confirm("هل أنت متأكد من إزالة هذا المساعد الإداري من المنظمة؟")) return;

    try {
      await removeSubAdmin(orgId, userId);
      setMsg("تمت إزالة المساعد الإداري.");
      setTimeout(() => setMsg(""), 3000);
      await loadTabData();
    } catch (err) {
      console.error("Remove sub-admin error:", err);
      setError("تعذر إزالة المساعد الإداري.");
    }
  };

  return (
    <DashboardLayout role="org">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--heading-text)" }}>
            إعدادات المنظمة
          </h1>
          <p style={{ fontSize: "0.8rem", color: "var(--muted-text)", marginTop: 3 }}>
            منظمة: {currentOrg?.name || "منظمتك"} — تخصيص الملف، وسائل الاتصال، بوابات الدفع، وإدارة الفريق
          </p>
        </div>

        <button
          className="btn btn--outline btn--sm"
          onClick={loadTabData}
          title="تحديث البيانات"
          style={{ display: "flex", alignItems: "center", gap: 4 }}
        >
          <FiRefreshCw size={13} className={loading ? "spin" : ""} />
          تحديث
        </button>
      </div>

      {msg && (
        <div className="alert alert--success" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: 6 }}>
          <FiCheckCircle size={15} /> {msg}
        </div>
      )}

      {error && (
        <div className="alert alert--error" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: 6 }}>
          <FiAlertCircle size={15} /> {error}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {[
         
          ["contacts", `وسائل التواصل (${contacts.length})`],
          ["payment", "بوابة Paymob"],
          ["subadmins", `المساعدون الإداريون (${subAdmins.length})`],
        ].map(([id, label]) => (
          <button
            key={id}
            className={`tab${tab === id ? " tab--active" : ""}`}
            onClick={() => handleTabChange(id )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Main Form Container */}
      <div className="card" style={{ padding: "1.5rem", maxWidth: 640 }}>
     
        {/* Tab 2: Contacts */}
        {tab === "contacts" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--heading-text)" }}>
                  وسائل التواصل المعتمدة
                </h2>
                <p style={{ fontSize: "0.75rem", color: "var(--muted-text)", marginTop: 2 }}>
                  أرقام الهواتف، البريد الإلكتروني، والروابط الرسمية للمنظمة.
                </p>
              </div>

              {!showAddContact && (
                <Button size="sm" onClick={() => setShowAddContact(true)} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <FiPlus size={13} /> إضافة وسيلة
                </Button>
              )}
            </div>

            {/* Add Contact Form */}
            {showAddContact && (
              <form onSubmit={handleAddContact} style={{ padding: "1rem", background: "var(--bg-soft)", borderRadius: 8, marginBottom: "1.25rem", border: "1px solid var(--border)" }}>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: 8 }}>
                  إضافة وسيلة تواصل جديدة
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <select
                    className="field-select"
                    style={{ width: "clamp(110px, 28%, 140px)" }}
                    value={newContactType}
                    onChange={(e) => setNewContactType(e.target.value)}
                  >
                    {CONTACT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>

                  <input
                    className="field-input"
                    style={{ flex: 1, minWidth: "min(100%, 150px)" }}
                    placeholder="رقم الهاتف أو البريد أو الرابط..."
                    value={newContactValue}
                    onChange={(e) => setNewContactValue(e.target.value)}
                    required
                  />

                  <div style={{ display: "flex", gap: 6 }}>
                    <Button size="sm" isLoading={saving} type="submit">
                      إضافة
                    </Button>
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowAddContact(false)}>
                      إلغاء
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Contacts List */}
            {loading ? (
              <div className="muted" style={{ padding: "1.5rem", textAlign: "center" }}>
                جاري تحميل وسائل التواصل...
              </div>
            ) : contacts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted-text)" }}>
                <FiPhone size={28} style={{ opacity: 0.3, marginBottom: 8, display: "block", margin: "0 auto" }} />
                لا توجد وسائل تواصل مسجلة حالياً.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {contacts.map((c) => {
                  const typeObj = CONTACT_TYPES.find((t) => t.value.toLowerCase() === String(c.type).toLowerCase()) || {
                    label: c.type || "أخرى",
                    icon: <FiPhone size={13} />
                  };

                  return (
                    <div
                      key={c.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.75rem 1rem",
                        background: "var(--bg-soft)",
                        borderRadius: 8,
                        border: "1px solid var(--border)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ padding: 6, background: "var(--bg-card)", borderRadius: 6, color: "var(--brand-green)" }}>
                          {typeObj.icon}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.85rem", direction: "ltr", textAlign: "right" }}>
                            {c.value}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "var(--muted-text)" }}>
                            {typeObj.label}
                          </div>
                        </div>
                      </div>

                      <button
                        className="btn btn--ghost btn--sm"
                        style={{ padding: "4px 8px", color: "var(--error)" }}
                        title="حذف وسيلة التواصل"
                        onClick={() => handleDeleteContact(c.id)}
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Payment (Paymob) */}
        {tab === "payment" && (
          <form onSubmit={handleSavePayment} style={{ display: "flex", flexDirection: "column", gap: "0.95rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FiShield color="var(--brand-green)" size={20} />
                <div>
                  <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--heading-text)" }}>
                    إعدادات بوابة Paymob
                  </h2>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted-text)", marginTop: 2 }}>
                    ربط حساب المنظمة المعتمد لدى Paymob لاستقبال التبرعات المالية إلكترونياً.
                  </p>
                </div>
              </div>

              {paymentInfo && (
                <span className="badge badge--green" style={{ fontSize: "0.75rem" }}>
                  بوابة نشطة ✓
                </span>
              )}
            </div>

            <div className="alert alert--info" style={{ fontSize: "0.78rem" }}>
              يتم تشفير وتخزين مفاتيح API بشكل آمن وفق أعلى معايير الحماية المصرفية.
            </div>

            <div className="form-group">
              <label className="field-label">المفتاح الأساسي (API Key) *</label>
              <input
                className="field-input"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="ZXlKaGJHY2lPaUpTVXpVeE..."
                required
              />
            </div>

            <div className="form-group">
              <label className="field-label">معرف التكامل (Integration ID) *</label>
              <input
                className="field-input"
                value={integrationId}
                onChange={(e) => setIntegrationId(e.target.value)}
                placeholder="مثال: 123456"
                required
              />
            </div>

            <div className="form-group">
              <label className="field-label">معرف إطار الدفع (Iframe ID) *</label>
              <input
                className="field-input"
                value={iframeId}
                onChange={(e) => setIframeId(e.target.value)}
                placeholder="مثال: 789012"
                required
              />
            </div>

            <div className="form-group">
              <label className="field-label">مفتاح التوثيق (HMAC Secret) *</label>
              <input
                className="field-input"
                type="password"
                value={hmacKey}
                onChange={(e) => setHmacKey(e.target.value)}
                placeholder="مفتاح HMAC السري من لوحة Paymob"
                required
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              {paymentInfo ? (
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  style={{ color: "var(--error)", borderColor: "var(--error)" }}
                  onClick={handleDeletePayment}
                >
                  <FiTrash2 size={12} /> إزالة مفاتيح الدفع
                </button>
              ) : <div />}

              <Button isLoading={saving} type="submit">
                {paymentInfo ? "تحديث مفاتيح الدفع" : "حفظ وربط بوابة Paymob"}
              </Button>
            </div>
          </form>
        )}

        {/* Tab 4: Sub-admins */}
        {tab === "subadmins" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--heading-text)" }}>
                  المساعدون الإداريون
                </h2>
                <p style={{ fontSize: "0.75rem", color: "var(--muted-text)", marginTop: 2 }}>
                  إدارة أعضاء الفريق الذين يمتلكون صلاحية إنشاء ومتابعة الحملات نيابة عن المنظمة.
                </p>
              </div>

              <Button size="sm" onClick={openAddSubAdminModal} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <FiUserPlus size={13} /> إضافة مساعد
              </Button>
            </div>

            {loading ? (
              <div className="muted" style={{ padding: "1.5rem", textAlign: "center" }}>
                جاري تحميل المساعدين الإداريين...
              </div>
            ) : subAdmins.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted-text)" }}>
                <FiUser size={30} style={{ opacity: 0.3, marginBottom: 8, display: "block", margin: "0 auto" }} />
                لا يوجد مساعدون إداريون معينون لهذه المنظمة حتى الآن.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {subAdmins.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.85rem 1rem",
                      background: "var(--bg-soft)",
                      borderRadius: 8,
                      border: "1px solid var(--border)"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>
                        {s.fullName || s.userName || s.id}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted-text)", marginTop: 2 }}>
                        {s.email || `ID: ${s.id}`}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="badge badge--blue" style={{ fontSize: "0.72rem" }}>مساعد إداري</span>
                      <button
                        className="btn btn--ghost btn--sm"
                        style={{ padding: "4px 8px", color: "var(--error)" }}
                        title="إزالة الصلاحية"
                        onClick={() => handleRemoveSubAdmin(s.id)}
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Sub-Admin Modal */}
      {showAddSubAdminModal && (
        <div className="modal-backdrop" onClick={() => setShowAddSubAdminModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal__header">
              <h3 className="modal__title">إضافة مساعد إداري للمنظمة</h3>
              <button
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-text)" }}
                onClick={() => setShowAddSubAdminModal(false)}
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubAdmin} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <div className="form-group">
                <label className="field-label">اختر مستخدماً من النظام</label>
                {loadingUsers ? (
                  <div className="muted" style={{ fontSize: "0.8rem" }}>جاري تحميل المستخدمين...</div>
                ) : availableUsers.length > 0 ? (
                  <select
                    className="field-select"
                    value={subAdminUserName}
                    onChange={(e) => setSubAdminUserName(e.target.value)}
                  >
                    <option value="">-- اختر مستخدم --</option>
                    {availableUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName || u.userName} ({u.email || u.id})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="muted" style={{ fontSize: "0.8rem" }}>لا يمكن جلب قائمة المستخدمين مباشرة، استخدم الإدخال اليدوي أدناه.</div>
                )}
              </div>

              <div className="form-group">
                <label className="field-label">أو أدخل معرف المستخدم (الايميل) مباشرة</label>
                <input
                  className="field-input"
                  placeholder="مثال: abdallahsharawy@gmail.com"
                  value={subAdminUserName}
                  onChange={(e) => setSubAdminUserName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => setShowAddSubAdminModal(false)}
                >
                  إلغاء
                </button>
                <Button isLoading={saving} size="sm" type="submit">
                  تعيين كمساعد إداري
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
