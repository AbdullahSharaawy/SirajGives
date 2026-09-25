// src/pages/Profile/Profile.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiUser,
  FiLock,
  FiHeart,
  FiEdit2,
  FiSave,
  FiX,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiSearch,
  FiRefreshCw
} from "react-icons/fi";
import PageLayout from "../../components/PageLayout";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import {
  getUserProfile,
  updateProfile,
  changePassword,
 
} from "../../services/userApi";
import { getUserDonationHistory } from "../../services/donationApi";
import "./Profile.css";

const PasswordStrengthRow = ({ condition, label }) => (
  <div className={`profile-strength-row ${condition ? "success" : "fail"}`}>
    {condition ? <FiCheck size={14} /> : <FiX size={14} />}
    <span>{label}</span>
  </div>
);

export default function Profile() {
  const { user, isAuth, isSuperAdmin } = useAuth();
  const nav = useNavigate();

  // Active tab: "profile" | "history" | "password"
  const [tab, setTab] = useState("profile");

  // Profile data from UserDetailResponseDto
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Edit mode state (EditUserRequestDto: FullName, UserName, PhoneNumber, Address)
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    userName: "",
    phoneNumber: "",
    address: "",
  });
  const [editErrors, setEditErrors] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password tab state
  const [pwMode, setPwMode] = useState("direct"); // "direct" | "resetCycle"
  const [directPw, setDirectPw] = useState({ old: "", new: "", confirm: "" });
  const [showDirectPw, setShowDirectPw] = useState({ old: false, new: false, confirm: false });
  const [directPwMsg, setDirectPwMsg] = useState({ type: "", text: "" });
  const [isSavingDirectPw, setIsSavingDirectPw] = useState(false);

 
  // Donations history state
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Load user profile details
  const fetchProfileDetails = async () => {
    if (!user?.id) return;
    setLoadingProfile(true);
    setProfileError("");
    try {
      const data = await getUserProfile(user.id);
      if (data) {
        setProfileData(data);
        console.log(data);
        setEditForm({
          fullName: data.fullName || user.name || "",
          userName: data.userName || "",
          phoneNumber: data.phoneNumber || "",
          address: data.address || "",
        });
      }
    } catch (err) {
      console.warn("Could not fetch full user details from API, using auth claims:", err);
      // Fallback to claims if backend call fails
      const fallback = {
        id: user.id,
        fullName: user.name || "مستخدم سراج",
        userName: user.name || "",
        email: user.email || "",
        phoneNumber: "",
        address: "",
        isDeleted: false,
        registrationDate: null,
        updatedOn: null,
        roles: isSuperAdmin ? ["SuperAdmin"] : ["User"],
      };
      setProfileData(fallback);
      setEditForm({
        fullName: fallback.fullName,
        userName: fallback.userName,
        phoneNumber: "",
        address: "",
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  // Load donation history
  const fetchDonations = async () => {
    if (!user?.id) return;
    setLoadingHistory(true);
    setHistoryError("");
    try {
      const items = await getUserDonationHistory(user.id);
      const list = Array.isArray(items) ? items : items?.items ?? [];
      setHistory(list);
    } catch (err) {
      if (err.response?.status === 403) {
        setHistory([]);
      } else {
        setHistoryError("تعذر تحميل سجل التبرعات. يرجى المحاولة مرة أخرى.");
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isAuth && user?.id) {
      fetchProfileDetails();
      fetchDonations();
    }
  }, [user?.id, isAuth]);

  // Password strength checklist evaluation
  const evalPasswordStrength = (pwd) => ({
    hasMinLength: (pwd || "").length >= 8,
    hasUpperCase: /[A-Z]/.test(pwd || ""),
    hasLowerCase: /[a-z]/.test(pwd || ""),
    hasNumber: /\d/.test(pwd || ""),
    hasSpecialChar: /[@$!%*?&]/.test(pwd || ""),
  });

  const directPwStrength = evalPasswordStrength(directPw.new);
  const isDirectPwValid =
    directPwStrength.hasMinLength &&
    directPwStrength.hasUpperCase &&
    directPwStrength.hasLowerCase &&
    directPwStrength.hasNumber &&
    directPwStrength.hasSpecialChar &&
    directPw.new === directPw.confirm &&
    Boolean(directPw.old);

  
  // Validate Edit Form (EditUserRequestDto)
  const validateEditForm = () => {
    const errors = {};
    if (!editForm.fullName?.trim()) {
      errors.fullName = "الاسم الكامل مطلوب";
    }
    if (!editForm.userName?.trim()) {
      errors.userName = "اسم المستخدم مطلوب";
    } else if (editForm.userName.trim().length < 3) {
      errors.userName = "اسم المستخدم يجب أن يكون 3 أحرف على الأقل";
    } else if (editForm.userName.trim().length > 256) {
      errors.userName = "اسم المستخدم لا يمكن أن يتجاوز 256 حرفاً";
    }
    if (editForm.address && editForm.address.length > 500) {
      errors.address = "العنوان لا يمكن أن يتجاوز 500 حرف";
    }
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateEditForm()) return;
    setIsSavingProfile(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      await updateProfile({
        fullName: editForm.fullName.trim(),
        userName: editForm.userName.trim(),
        phoneNumber: editForm.phoneNumber?.trim() || null,
        address: editForm.address?.trim() || null,
      });

      setProfileSuccess("تم تحديث البيانات الشخصية بنجاح.");
      setIsEditing(false);
      await fetchProfileDetails();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "تعذر حفظ البيانات الشخصية. يرجى التحقق من المدخلات.";
      setProfileError(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditErrors({});
    if (profileData) {
      setEditForm({
        fullName: profileData.fullName || user?.name || "",
        userName: profileData.userName || "",
        phoneNumber: profileData.phoneNumber || "",
        address: profileData.address || "",
      });
    }
  };

  // Direct password change handler
  const handleDirectPasswordChange = async (e) => {
    e.preventDefault();
    if (!isDirectPwValid) return;

    setIsSavingDirectPw(true);
    setDirectPwMsg({ type: "", text: "" });

    try {
      await changePassword({
        currentPassword: directPw.old,
        newPassword: directPw.new,
        confirmPassword: directPw.confirm,
      });
      setDirectPwMsg({ type: "success", text: "تم تغيير كلمة المرور بنجاح!" });
      setDirectPw({ old: "", new: "", confirm: "" });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.data) ? err.response?.data?.data.join(", ") : "") ||
        "تعذر تغيير كلمة المرور. تأكد من صحة كلمة المرور الحالية.";
      setDirectPwMsg({ type: "error", text: msg });
    } finally {
      setIsSavingDirectPw(false);
    }
  };

  

  // Filter donations
  const filteredDonations = useMemo(() => {
    if (!searchTerm.trim()) return history;
    const term = searchTerm.toLowerCase();
    return history.filter((item) => {
      const camp = (item.campaignName || item.campaign?.title || item.title || "").toLowerCase();
      const org = (item.organizationName || item.organization?.name || "").toLowerCase();
      return camp.includes(term) || org.includes(term);
    });
  }, [history, searchTerm]);

  // Donation statistics
  const donationStats = useMemo(() => {
    const totalAmount = history.reduce(
      (sum, item) => sum + Number(item.amount ?? item.donationAmount ?? 0),
      0
    );
    const count = history.length;
    const avg = count > 0 ? Math.round(totalAmount / count) : 0;
    return { totalAmount, count, avg };
  }, [history]);

  if (!isAuth) {
    return (
      <PageLayout>
        <div className="empty-state" style={{ padding: "4rem 1rem" }}>
          <div className="empty-state__icon">🔒</div>
          <div className="empty-state__text" style={{ marginBottom: "1rem" }}>
            يجب تسجيل الدخول لعرض هذه الصفحة
          </div>
          <button className="btn btn--primary" onClick={() => nav("/login")}>
            تسجيل الدخول
          </button>
        </div>
      </PageLayout>
    );
  }

  const displayName = profileData?.fullName || user?.name || "المستخدم";
  const displayUserName = profileData?.userName ? `@${profileData.userName}` : "";
  const rolesList = profileData?.roles || (isSuperAdmin ? ["SuperAdmin"] : ["متبرع"]);
console.log(rolesList);
  return (
    <PageLayout>
      <div className="page-header">
        <div className="page-container">
          <h1 className="page-title">حسابي</h1>
        </div>
      </div>

      <div className="page-container profile-page" style={{ padding: "2rem 1.25rem" }}>
        {profileError && (
          <div className="alert alert--warning" style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 8 }}>
            <FiAlertCircle size={16} />
            <span>{profileError}</span>
          </div>
        )}

        {profileSuccess && (
          <div className="alert alert--info" style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 8, background: "#e8f5e9", color: "#2e7d32", borderColor: "#c8e6c9" }}>
            <FiCheckCircle size={16} />
            <span>{profileSuccess}</span>
          </div>
        )}

        {/* Profile Hero Header */}
        <div className="profile-hero-card">
          <div className="profile-user-summary">
            <div className="profile-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="profile-names">
              <div className="profile-fullname">{displayName}</div>
              {displayUserName && <div className="profile-username">{displayUserName}</div>}
              <div className="profile-badges-row">
                {rolesList.map((r, i) => (
                  <span key={i} className="badge badge--green">
                    <FiShield size={10} /> {r === "SuperAdmin" ? "مدير عام" : r === "OrganizationAdmin" ? "مسؤول منظمة" : r}
                  </span>
                ))}
                <span className="badge badge--blue">
                  <FiCheckCircle size={10} /> حساب نشط
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            {tab === "profile" && !isEditing && (
              <button
                className="btn btn--outline btn--sm"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
                onClick={() => setIsEditing(true)}
              >
                <FiEdit2 size={13} /> تعديل البيانات
              </button>
            )}
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="profile-layout">
          {/* Sidebar Nav */}
          <div className="card profile-sidebar">
            {[
              { id: "profile", label: "البيانات الشخصية", icon: <FiUser size={15} /> },
              { id: "history", label: "سجل التبرعات", icon: <FiHeart size={15} /> },
              { id: "password", label: "الأمان وكلمة المرور", icon: <FiLock size={15} /> },
            ].map((item) => (
              <button
                key={item.id}
                className={`profile-nav-item ${tab === item.id ? "profile-nav-item--active" : ""}`}
                onClick={() => {
                  setTab(item.id);
                  setProfileError("");
                  setProfileSuccess("");
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="card" style={{ padding: "1.75rem" }}>
            {/* ── Tab 1: Profile Details & Edit ── */}
            {tab === "profile" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                  <h2 className="section-title">
                    {isEditing ? "تعديل البيانات الشخصية" : "بيانات الحساب (User Details)"}
                  </h2>
                  {isEditing && (
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={handleCancelEdit}
                      disabled={isSavingProfile}
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <FiX size={13} /> إلغاء
                    </button>
                  )}
                </div>

                {loadingProfile ? (
                  <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted-text)" }}>
                    <div className="spinner" style={{ margin: "0 auto 0.75rem", borderTopColor: "var(--brand-green)" }}></div>
                    جاري تحميل بيانات الحساب...
                  </div>
                ) : isEditing ? (
                  /* Edit Mode - Fields from EditUserRequestDto */
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 540 }}>
                    <div className="form-group">
                      <label className="field-label">الاسم الكامل *</label>
                      <input
                        className={`field-input ${editErrors.fullName ? "error" : ""}`}
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        placeholder="أدخل الاسم الكامل"
                      />
                      {editErrors.fullName && <span className="field-error">{editErrors.fullName}</span>}
                    </div>

                    <div className="form-group">
                      <label className="field-label">اسم المستخدم (Username) *</label>
                      <input
                        className={`field-input ${editErrors.userName ? "error" : ""}`}
                        value={editForm.userName}
                        onChange={(e) => setEditForm({ ...editForm, userName: e.target.value })}
                        placeholder="اسم المستخدم الفريد"
                      />
                      {editErrors.userName && <span className="field-error">{editErrors.userName}</span>}
                    </div>

                    <div className="form-group">
                      <label className="field-label">البريد الإلكتروني (غير قابل للتعديل المباشر)</label>
                      <input
                        className="field-input"
                        value={profileData?.email || user?.email || ""}
                        disabled
                        style={{ backgroundColor: "var(--bg-soft)", color: "var(--muted-text)", cursor: "not-allowed" }}
                      />
                      <span style={{ fontSize: "0.7rem", color: "var(--muted-text)", marginTop: 3 }}>
                        لحماية أمان الحساب، لا يمكن تعديل عنوان البريد الإلكتروني من هنا.
                      </span>
                    </div>

                    <div className="form-group">
                      <label className="field-label">رقم الهاتف</label>
                      <input
                        className="field-input"
                        type="tel"
                        value={editForm.phoneNumber}
                        onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                        placeholder="مثال: 01012345678"
                      />
                    </div>

                    <div className="form-group">
                      <label className="field-label">العنوان</label>
                      <textarea
                        className="field-textarea"
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        placeholder="أدخل العنوان بالتفصيل..."
                        rows={3}
                      />
                      {editErrors.address && <span className="field-error">{editErrors.address}</span>}
                    </div>

                    <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                      <Button isLoading={isSavingProfile} onClick={handleSaveProfile} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <FiSave size={14} /> حفظ التغييرات
                      </Button>
                      <button className="btn btn--ghost" onClick={handleCancelEdit} disabled={isSavingProfile}>
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode - Full fields from UserDetailResponseDto */
                  <div className="profile-details-grid">
                    <div className="detail-item">
                      <div className="detail-item__label">
                        <FiUser size={14} /> الاسم الكامل
                      </div>
                      <div className="detail-item__value">
                        {profileData?.fullName || <span className="detail-item__empty">غير محدد</span>}
                      </div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-item__label">
                        <FiUser size={14} /> اسم المستخدم
                      </div>
                      <div className="detail-item__value">
                        {profileData?.userName || <span className="detail-item__empty">غير محدد</span>}
                      </div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-item__label">
                        <FiMail size={14} /> البريد الإلكتروني
                      </div>
                      <div className="detail-item__value">
                        {profileData?.email || user?.email || <span className="detail-item__empty">غير محدد</span>}
                      </div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-item__label">
                        <FiPhone size={14} /> رقم الهاتف
                      </div>
                      <div className="detail-item__value">
                        {profileData?.phoneNumber || <span className="detail-item__empty">لم يتم إضافته</span>}
                      </div>
                    </div>

                    <div className="detail-item" style={{ gridColumn: "span 2" }}>
                      <div className="detail-item__label">
                        <FiMapPin size={14} /> العنوان
                      </div>
                      <div className="detail-item__value">
                        {profileData?.address || <span className="detail-item__empty">لم يتم إضافة عنوان</span>}
                      </div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-item__label">
                        <FiCalendar size={14} /> تاريخ الانضمام والتسجيل
                      </div>
                      <div className="detail-item__value">
                        {profileData?.registrationDate ? (
                          new Date(profileData.registrationDate).toLocaleDateString("ar-EG", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        ) : (
                          <span className="detail-item__empty">غير مسجل</span>
                        )}
                      </div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-item__label">
                        <FiCalendar size={14} /> آخر تحديث للحساب
                      </div>
                      <div className="detail-item__value">
                        {profileData?.updatedOn ? (
                          new Date(profileData.updatedOn).toLocaleDateString("ar-EG", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        ) : (
                          <span className="detail-item__empty">لا يوجد تعديلات سابقة</span>
                        )}
                      </div>
                    </div>

                    <div className="detail-item" style={{ gridColumn: "span 2" }}>
                      <div className="detail-item__label">
                        <FiShield size={14} /> نوع الحساب والأدوار
                      </div>
                      <div className="detail-item__value" style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: 4 }}>
                        {rolesList.map((r, idx) => (
                          
                          <span key={idx} className="badge badge--green">
                            {r === "SuperAdmin" ? "مدير عام" : r === "OrganizationAdmin" ? "مسؤول منظمة" : r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab 2: Donation History ── */}
            {tab === "history" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: 10 }}>
                  <h2 className="section-title">سجل التبرعات</h2>
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={fetchDonations}
                    disabled={loadingHistory}
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <FiRefreshCw className={loadingHistory ? "spinning" : ""} size={12} /> تحديث السجل
                  </button>
                </div>

                {historyError && (
                  <div className="alert alert--warning" style={{ marginBottom: "1rem" }}>
                    {historyError}
                  </div>
                )}

                {/* Donation Statistics Overview */}
                <div className="donation-stats-grid">
                  <div className="donation-stat-box">
                    <span className="donation-stat-box__label">إجمالي التبرعات</span>
                    <span className="donation-stat-box__val">
                      {donationStats.totalAmount.toLocaleString("ar-EG")} ج.م
                    </span>
                    <span className="donation-stat-box__sub">مساهماتك الخيرية الكاملة</span>
                  </div>

                  <div className="donation-stat-box">
                    <span className="donation-stat-box__label">عدد مرات التبرع</span>
                    <span className="donation-stat-box__val">{donationStats.count}</span>
                    <span className="donation-stat-box__sub">عملية تبرع موثقة</span>
                  </div>

                  <div className="donation-stat-box">
                    <span className="donation-stat-box__label">متوسط التبرع</span>
                    <span className="donation-stat-box__val">
                      {donationStats.avg.toLocaleString("ar-EG")} ج.م
                    </span>
                    <span className="donation-stat-box__sub">لكل عملية تبرع</span>
                  </div>
                </div>

                {/* Search Bar for History */}
                {history.length > 0 && (
                  <div className="search-bar donations-search-bar">
                    <input
                      type="text"
                      placeholder="ابحث باسم الحملة أو المنظمة..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="button" aria-label="بحث">
                      <FiSearch size={14} />
                    </button>
                  </div>
                )}

                {/* Donations Table */}
                <div style={{ overflowX: "auto" }}>
                  {loadingHistory ? (
                    <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--muted-text)" }}>
                      <div className="spinner" style={{ margin: "0 auto 0.75rem", borderTopColor: "var(--brand-green)" }}></div>
                      جاري تحميل سجل التبرعات...
                    </div>
                  ) : filteredDonations.length === 0 ? (
                    <div className="empty-state" style={{ padding: "2.5rem 1rem" }}>
                      <div className="empty-state__icon">
                        <FiHeart size={36} color="var(--brand-green)" style={{ opacity: 0.6 }} />
                      </div>
                      <div className="empty-state__text" style={{ marginBottom: "0.5rem", fontSize: "1rem" }}>
                        {searchTerm ? "لا توجد تبرعات مطابقة لبحثك" : "لا يوجد سجل تبرعات متاح لحسابك حالياً"}
                      </div>
                      <p className="muted" style={{ marginBottom: "1.25rem", fontSize: "0.82rem" }}>
                        يمكنك البدء بدعم الحملات الخيرية الفعالة وصنع فارق اليوم.
                      </p>
                      <button className="btn btn--primary btn--sm" onClick={() => nav("/campaigns")}>
                        تصفح الحملات وتبرع الآن
                      </button>
                    </div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>الحملة</th>
                          <th>المنظمة</th>
                          <th>المبلغ</th>
                          <th>التاريخ</th>
                          <th>الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDonations.map((h, idx) => (
                          <tr key={h.id || idx}>
                            <td style={{ fontWeight: 600 }}>
                              {h.campaignId ? (
                                <Link to={`/campaigns/solo/${h.campaignId}`} style={{ color: "inherit" }}>
                                  {h.campaignName ?? h.campaign?.title ?? h.title ?? `حملة #${h.campaignId}`}
                                </Link>
                              ) : (
                                h.campaignName ?? h.campaign?.title ?? h.title ?? "-"
                              )}
                            </td>
                            <td className="muted">{h.organizationName ?? h.organization?.name ?? "-"}</td>
                            <td style={{ color: "var(--brand-green)", fontWeight: 700 }}>
                              {Number(h.amount ?? h.donationAmount ?? 0).toLocaleString("ar-EG")} ج.م
                            </td>
                            <td className="muted">
                              {h.createdAt
                                ? new Date(h.createdAt).toLocaleDateString("ar-EG", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : h.date ?? "-"}
                            </td>
                            <td>
                              <span className="badge badge--green">
                                {h.status ?? "مكتمل بنجاح"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* ── Tab 3: Password Management (With Reset Password Cycle) ── */}
            {tab === "password" && (
              <div style={{ maxWidth: 500 }}>
                <h2 className="section-title" style={{ marginBottom: "0.5rem" }}>
                  الأمان وكلمة المرور
                </h2>
                <p className="muted" style={{ fontSize: "0.82rem", marginBottom: "1.25rem" }}>
                  يمكنك تغيير كلمة المرور مباشرة أو استخدام دورة إعادة التعيين عبر البريد الإلكتروني.
                </p>

                

                {/* Mode A: Direct Password Change */}
                 
                  <form onSubmit={handleDirectPasswordChange} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                    {directPwMsg.text && (
                      <div className={`alert ${directPwMsg.type === "success" ? "alert--info" : "alert--warning"}`} style={{ fontSize: "0.82rem" }}>
                        {directPwMsg.text}
                      </div>
                    )}

                    <div className="form-group">
                      <label className="field-label">كلمة المرور الحالية *</label>
                      <div className="password-input-container">
                        <input
                          className="field-input"
                          type={showDirectPw.old ? "text" : "password"}
                          value={directPw.old}
                          onChange={(e) => setDirectPw({ ...directPw, old: e.target.value })}
                          placeholder="أدخل كلمة المرور الحالية"
                          required
                        />
                        <button
                          type="button"
                          className="password-visibility-btn"
                          onClick={() => setShowDirectPw({ ...showDirectPw, old: !showDirectPw.old })}
                          aria-label="تبديل عرض كلمة المرور"
                        >
                          {showDirectPw.old ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="field-label">كلمة المرور الجديدة *</label>
                      <div className="password-input-container">
                        <input
                          className="field-input"
                          type={showDirectPw.new ? "text" : "password"}
                          value={directPw.new}
                          onChange={(e) => setDirectPw({ ...directPw, new: e.target.value })}
                          placeholder="أدخل كلمة المرور الجديدة"
                          required
                        />
                        <button
                          type="button"
                          className="password-visibility-btn"
                          onClick={() => setShowDirectPw({ ...showDirectPw, new: !showDirectPw.new })}
                          aria-label="تبديل عرض كلمة المرور"
                        >
                          {showDirectPw.new ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Strict Password Requirements Checklist matching ResetPassword.jsx */}
                    <div className="profile-strength-box">
                      <div className="profile-strength-title">متطلبات كلمة المرور:</div>
                      <PasswordStrengthRow condition={directPwStrength.hasMinLength} label="8 أحرف على الأقل" />
                      <PasswordStrengthRow condition={directPwStrength.hasUpperCase} label="حرف كبير واحد على الأقل (A-Z)" />
                      <PasswordStrengthRow condition={directPwStrength.hasLowerCase} label="حرف صغير واحد على الأقل (a-z)" />
                      <PasswordStrengthRow condition={directPwStrength.hasNumber} label="رقم واحد على الأقل (0-9)" />
                      <PasswordStrengthRow condition={directPwStrength.hasSpecialChar} label="رمز خاص واحد على الأقل (@$!%*?&)" />
                    </div>

                    <div className="form-group">
                      <label className="field-label">تأكيد كلمة المرور الجديدة *</label>
                      <div className="password-input-container">
                        <input
                          className="field-input"
                          type={showDirectPw.confirm ? "text" : "password"}
                          value={directPw.confirm}
                          onChange={(e) => setDirectPw({ ...directPw, confirm: e.target.value })}
                          placeholder="أعد إدخال كلمة المرور للتأكيد"
                          required
                        />
                        <button
                          type="button"
                          className="password-visibility-btn"
                          onClick={() => setShowDirectPw({ ...showDirectPw, confirm: !showDirectPw.confirm })}
                          aria-label="تبديل عرض كلمة المرور"
                        >
                          {showDirectPw.confirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                      </div>
                      {directPw.confirm && directPw.new !== directPw.confirm && (
                        <span className="field-error">كلمتا المرور غير متطابقتين</span>
                      )}
                    </div>

                    <Button type="submit" isLoading={isSavingDirectPw} disabled={!isDirectPwValid} style={{ marginTop: "0.5rem" }}>
                      تحديث كلمة المرور
                    </Button>
                  </form>
                

              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
