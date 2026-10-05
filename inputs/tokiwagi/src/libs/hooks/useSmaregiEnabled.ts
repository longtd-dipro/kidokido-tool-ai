import { TenantVersion } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";

import { fetchTenantByCode } from "services/api-client/admin/tenant.service";

const SMAREGI_ENABLED_VERSIONS: TenantVersion[] = [
  TenantVersion.v1,
  TenantVersion.v2,
];

type UseSmaregiEnabledReturn = {
  isEnabledSmaregi: boolean;
  loading: boolean;
  error: string | null;
};

export const useSmaregiEnabled = (
  tenantCode?: string
): UseSmaregiEnabledReturn => {
  const [allowedVersion, setAllowedVersion] = useState<TenantVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenant = async (code: string) => {
    try {
      setLoading(true);
      setError(null);

      const tenant = await fetchTenantByCode(code);
      setAllowedVersion(tenant.allowedVersion ?? null);
    } catch (err: any) {
      const message = err.response?.data?.error || err.message;
      setError(message);
      setAllowedVersion(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tenantCode) {
      setAllowedVersion(null);
      setError(null);
      return;
    }

    setLoading(true);
    fetchTenant(tenantCode);
  }, [tenantCode]);

  const isEnabled = useMemo(() => {
    if (!allowedVersion) return false;

    return SMAREGI_ENABLED_VERSIONS.includes(allowedVersion);
  }, [allowedVersion]);

  return {
    isEnabledSmaregi: isEnabled,
    loading,
    error,
  };
};
