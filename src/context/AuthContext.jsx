// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

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

const needsOrgRoleCheck = (token) => {
  if (!token) return false;
  const claims = decodeClaims(token);
  const roles = getRoles(claims);
  const superAdmin = roles.includes('superadmin')
    || claims.IsSuperAdmin === true
    || claims.isSuperAdmin === true
    || claims['IsSuperAdmin'] === 'true'
    || claims['isSuperAdmin'] === 'true';
  if (superAdmin || hasOrgAdminRole(roles)) return false;
  const userId = getClaim(claims, ['sub', 'userId', 'id', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);
  const orgId = getClaim(claims, ['orgId', 'organizationId', 'OrganizationId']);
  return Boolean(orgId && userId);
};

const hasOrgAdminRole = (roles) =>
  roles.some((role) => ['orgadmin', 'organizationadmin', 'org-admin', 'organizationmanager'].includes(role));

const getClaim = (claims, names) => names.map((name) => claims[name]).find(Boolean);

const getRoles = (claims) => {
  const roles = claims.role
    || claims.roles
    || claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    || [];
  return (Array.isArray(roles) ? roles : [roles]).map((role) => String(role).toLowerCase());
};

const getAdminId = (admin) => admin?.id ?? admin?.userId ?? admin?.user?.id ?? admin?.user?.userId;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [loading, setLoading] = useState(() => needsOrgRoleCheck(localStorage.getItem('token')));
  const claims = decodeClaims(token);

  const roleList = getRoles(claims);
  const isSuperAdmin = roleList.includes('superadmin')
    || claims.IsSuperAdmin === true
    || claims.isSuperAdmin === true
    || claims['IsSuperAdmin'] === 'true'
    || claims['isSuperAdmin'] === 'true';
  const userId = getClaim(claims, ['sub', 'userId', 'id', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);
  const orgId = getClaim(claims, ['orgId', 'organizationId', 'OrganizationId']);
  const isOrgAdminFromClaims = hasOrgAdminRole(roleList);

  useEffect(() => {
    let active = true;

    const checkOrganizationRole = async () => {
      if (!token || isSuperAdmin) {
        if (active) {
          setIsOrgAdmin(false);
          setLoading(false);
        }
        return;
      }

      if (isOrgAdminFromClaims) {
        if (active) {
          setIsOrgAdmin(true);
          setLoading(false);
        }
        return;
      }

      if (!orgId || !userId) {
        if (active) {
          setIsOrgAdmin(false);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const [subAdminResponse, adminResponse] = await Promise.all([
          api.get(`/Organization/${orgId}/sub-admins/${userId}/check`, { skipAuthRedirect: true }),
          api.get(`/Organization/${orgId}/admin`, { skipAuthRedirect: true }),
        ]);
        const subAdminResult = subAdminResponse.data?.data ?? subAdminResponse.data;
        const admin = adminResponse.data?.data ?? adminResponse.data;
        const isOrganizationAdmin = Boolean(subAdminResult) || String(getAdminId(admin)) === String(userId);

        if (active) setIsOrgAdmin(isOrganizationAdmin);
      } catch {
        if (active) setIsOrgAdmin(false);
      } finally {
        if (active) setLoading(false);
      }
    };

    checkOrganizationRole();
    return () => { active = false; };
  }, [token, isSuperAdmin, isOrgAdminFromClaims, orgId, userId]);

  const login = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsOrgAdmin(false);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: Boolean(token),
      isAuth: Boolean(token),
      user: {
        id: userId,
        name: claims.name || claims.unique_name || claims.given_name || claims.email || '',
        email: claims.email || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '',
      },
      orgId,
      isSuperAdmin,
      isOrgAdmin,
      login,
      logout,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};