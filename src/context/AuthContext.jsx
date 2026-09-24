// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { isUserOrganizationAdmin } from "../services/adminApi";
import {
  getOrganizations,
  getOrganization,
  isUserSubAdmin,
  getOrganizationRoles,
  getUserOrganizationRole,
  getOrganizationAdmin,
} from '../services/organizationApi';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const claims = decodeClaims(token);
    if (!claims.exp) return false;
    return claims.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const getInitialToken = () => {
  const savedToken = localStorage.getItem('token');
  if (savedToken && isTokenExpired(savedToken)) {
    localStorage.removeItem('token');
    return null;
  }
  return savedToken;
};

const decodeClaims = (token) => {
  try {
    if (!token) return {};
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return {};
  }
};

const hasValidToken = (token) => {
  if (!token || isTokenExpired(token)) return false;
  return true;
};

const getClaim = (claims, names) => names.map((name) => claims[name]).find(Boolean);

const getRoles = (claims) => {
  const roles = claims.role
    || claims.roles
    || claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    || [];
  return (Array.isArray(roles) ? roles : [roles]).map((role) => String(role).toLowerCase());
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getInitialToken);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [currentOrg, setCurrentOrgState] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [userOrganizations, setUserOrganizations] = useState([]);
  const [loading, setLoading] = useState(() => hasValidToken(localStorage.getItem('token')));
  const claims = decodeClaims(token);

  // 1. SuperAdmin is stored directly in the JWT claims
  const roleList = getRoles(claims);
  const isSuperAdmin = roleList.includes('superadmin');
  const userId = getClaim(claims, ['sub', 'userId', 'id', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);

  const setCurrentOrg = (org) => {
    setCurrentOrgState(org);
    if (org?.id) {
      localStorage.setItem('admin_selected_org_id', String(org.id));
    }
  };

  const refreshOrg = async (targetOrgId) => {
    const id = targetOrgId || currentOrg?.id;
    if (!id) return;
    try {
      const details = await getOrganization(id);
      if (details) {
        setCurrentOrgState(details);
      }
    } catch (err) {
      console.error("Failed to refresh organization:", err);
    }
  };

  const checkOrganizationRole = async (activeToken = token) => {
    const activeClaims = decodeClaims(activeToken);
    const activeRoles = getRoles(activeClaims);
    const activeSuperAdmin = activeRoles.includes('superadmin');
    const activeUserId = getClaim(activeClaims, [
      'sub',
      'userId',
      'id',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
    ]);

    if (!activeToken || !activeUserId) {
      setIsOrgAdmin(false);
      setCurrentOrgState(null);
      setOrganizations([]);
      setUserOrganizations([]);
      setLoading(false);
      return {
        isSuperAdmin: false,
        isOrgAdmin: false,
        currentOrg: null,
        orgId: null,
        userOrganizations: [],
      };
    }

    setLoading(true);
    try {
      // 1. Check if user is organization admin via API check endpoint
      let isAdminApi = false;
      try {
        const response = await isUserOrganizationAdmin(activeUserId);
        const resVal = response.data?.data !== undefined ? response.data.data : response.data;
        isAdminApi = resVal === true || resVal === "true";
      } catch {
        isAdminApi = false;
      }

      // 2. Obtain organizations directly from OrganizationRoles entity
      let userOrgRoles = [];
      try {
        const rolesData = await getOrganizationRoles({ limit: 1000, page: 1 });
        const allRoles = Array.isArray(rolesData) ? rolesData : (rolesData?.items || []);

        userOrgRoles = allRoles.filter((r) => {
          const rUserId = r.userId || r.UserId;
          const isDeleted = Boolean(r.isDeleted || r.IsDeleted);
          return !isDeleted && rUserId && String(rUserId).toLowerCase() === String(activeUserId).toLowerCase();
        });
      } catch (err) {
        console.warn("Could not query OrganizationRoles entity directly:", err);
      }

      // Filter for Admin role in OrganizationRoles (OrganizationRoleType.Admin == 0 or 'Admin')
      const adminOrgRoles = userOrgRoles.filter((r) => {
        const roleVal = r.role ?? r.Role;
        return roleVal === 0 || roleVal === "0" || String(roleVal).toLowerCase() === "admin";
      });

      // Filter for SubAdmin role in OrganizationRoles (OrganizationRoleType.SubAdmin == 1 or 'SubAdmin')
      const subAdminOrgRoles = userOrgRoles.filter((r) => {
        const roleVal = r.role ?? r.Role;
        return roleVal === 1 || roleVal === "1" || String(roleVal).toLowerCase() === "subadmin";
      });

     // Extract organization IDs where user is Admin AND/OR SubAdmin
      let managedOrgIds = [
        ...adminOrgRoles.map((r) => r.organizationId ?? r.OrganizationId),
        ...subAdminOrgRoles.map((r) => r.organizationId ?? r.OrganizationId)
      ].filter(Boolean);

      // Remove duplicate IDs
      managedOrgIds = [...new Set(managedOrgIds)];

      if (managedOrgIds.length > 0) {
        isAdminApi = true;
      }

      // Fetch active organizations via API
      let orgsList = [];
      try {
        const fetchedOrgs = await getOrganizations(false);
        orgsList = Array.isArray(fetchedOrgs) ? fetchedOrgs : (fetchedOrgs?.items || []);
        setOrganizations(orgsList);
      } catch (e) {
        console.error("Could not fetch organizations from API:", e);
      }

      // 3. Fallback: If managedOrgIds is empty but user is admin or we need to find their org,
      // query organization-specific OrganizationRole endpoint or details
      if (managedOrgIds.length === 0 && orgsList.length > 0) {
        for (const org of orgsList) {
          let foundInOrg = false;
          try {
            // Check individual OrganizationRole entity for (org.id, activeUserId)
            const roleRes = await getUserOrganizationRole(org.id, activeUserId);
            if (roleRes && !roleRes.isDeleted && !roleRes.IsDeleted) {
              const rVal = roleRes.role ?? roleRes.Role;
              if (rVal === 0 || rVal === "0" || String(rVal).toLowerCase() === "admin") {
               const isSubAdmin = rVal === 1 || rVal === "1" || String(rVal).toLowerCase() === "subAdmin";
              
              if (isAdmin || isSubAdmin) {
                managedOrgIds.push(org.id);
                isAdminApi = true;
                foundInOrg = true;
              }
              }
            }
          } catch {
            // Ignore
          }
          if(!foundInOrg){
          try {
            const orgDetails = await getOrganization(org.id);
            const users = orgDetails?.users || orgDetails?.Users || [];
            if (Array.isArray(users) && users.some((u) => String(u?.id ?? u?.userId).toLowerCase() === String(activeUserId).toLowerCase())) {
              managedOrgIds.push(org.id);
              isAdminApi = true;
             
            }
          } catch {
            // Ignore
          }
        }
      }
    }
      // 4. Resolve matched organizations from the managedOrgIds obtained from OrganizationRoles
      let matchedOrgs = [];
      for (const mId of managedOrgIds) {
        const inList = orgsList.find((o) => String(o.id) === String(mId));
        if (inList) {
          matchedOrgs.push(inList);
        } else {
          try {
            const details = await getOrganization(mId);
            if (details) matchedOrgs.push(details);
          } catch {
            // Ignore
          }
        }
      }

      let matchedOrg = null;
      const savedOrgId = localStorage.getItem('admin_selected_org_id');

      if (!activeSuperAdmin && isAdminApi && matchedOrgs.length > 0) {
        matchedOrg = matchedOrgs.find((o) => String(o.id) === String(savedOrgId)) || matchedOrgs[0];
      }

      if (activeSuperAdmin && !matchedOrg && orgsList.length > 0) {
        matchedOrg = orgsList.find((o) => String(o.id) === String(savedOrgId)) || orgsList[0];
      }

      const orgAdminStatus = Boolean(isAdminApi || matchedOrgs.length > 0);
      setIsOrgAdmin(orgAdminStatus);
      const userOrgs = activeSuperAdmin ? orgsList : matchedOrgs;
      setUserOrganizations(userOrgs);

      let finalOrg = matchedOrg;
      if (matchedOrg) {
        try {
          const fullDetails = await getOrganization(matchedOrg.id);
          finalOrg = fullDetails || matchedOrg;
          setCurrentOrgState(finalOrg);
        } catch {
          setCurrentOrgState(matchedOrg);
        }
      } else {
        setCurrentOrgState(null);
      }

      return {
        isSuperAdmin: activeSuperAdmin,
        isOrgAdmin: orgAdminStatus,
        currentOrg: finalOrg,
        orgId: finalOrg?.id,
        userOrganizations: userOrgs,
      };
    } catch (err) {
      console.error("Error validating organization admin role via API:", err);
      setIsOrgAdmin(false);
      setCurrentOrgState(null);
      return {
        isSuperAdmin: activeSuperAdmin,
        isOrgAdmin: false,
        currentOrg: null,
        orgId: null,
        userOrganizations: [],
      };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkOrganizationRole(token);
  }, [token, isSuperAdmin, userId]);

  const login = async (newToken) => {
    if (!newToken || isTokenExpired(newToken)) {
      logout();
      return null;
    }
    localStorage.setItem('token', newToken);
    setToken(newToken);
    return await checkOrganizationRole(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin_selected_org_id');
    setToken(null);
    setIsOrgAdmin(false);
    setCurrentOrgState(null);
    setOrganizations([]);
    setUserOrganizations([]);
  };

  const isAuthenticated = Boolean(token) && !isTokenExpired(token);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isAuth: isAuthenticated,
      user: {
        id: userId,
        name: claims.name || claims.unique_name || claims.given_name || claims.email || '',
        email: claims.email || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '',
      },
      isSuperAdmin,
      isOrgAdmin,
      currentOrg,
      setCurrentOrg,
      orgId: currentOrg?.id,
      organizations,
      userOrganizations,
      refreshOrg,
      login,
      logout,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
