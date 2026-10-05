import { Tenant } from "models/Entity";
import { isAfterOrSameTime, isBeforeOrSameTime } from "utils/date-time";
import { getStorageUrl } from "utils/url";

export const getTenantByCode = (tenantCode: string, tenants: Tenant[]) => {
  return tenants.find((tenant) => tenant.code === tenantCode);
};

export const getTenantOptions = (tenants: Tenant[]) => tenants.map(({ code, name }) => ({ value: code, label: name }));

export const getTenantImagePath = (tenant: Tenant) => {
  if (!tenant?.imageUrl) {
    return null;
  }

  return getStorageUrl(tenant.imageUrl);
};

export const sortTenantsByAddressAndGuide = (tenants: Tenant[], searchTerm: string) => {
  if (!searchTerm) return tenants;

  tenants.forEach((tenant: any) => {
    tenant.score = 0;
    if (tenant.address && tenant.address.includes(searchTerm)) {
      tenant.score += TENANT_SORT_SCORE.ADDRESS;
    }

    if (tenant.guide && tenant.guide.includes(searchTerm)) {
      tenant.score += TENANT_SORT_SCORE.GUIDE;
    }
  });

  const sortedTenants = tenants.sort((tenant1: any, tenant2: any) => {
    return tenant2.score - tenant1.score;
  });

  return sortedTenants;
};

const TENANT_SORT_SCORE = {
  ADDRESS: 2,
  GUIDE: 1,
};

export const sortTenantsByFirstCharacterThenCreatedAt = (tenants: Tenant[]) => {
  const tenantsByFirstCharacterGroups: Record<string, Tenant[]> = {};
  tenants.forEach(tenant => {
    const firstCharacter = tenant.name[0];
    if (!tenantsByFirstCharacterGroups[firstCharacter]) {
      tenantsByFirstCharacterGroups[firstCharacter] = [tenant];
    } else {
      tenantsByFirstCharacterGroups[firstCharacter].push(tenant);
    }
  });

  // Sort by first character in ASC order
  const sortedTenantsByFirstCharacterGroups = Object.entries(tenantsByFirstCharacterGroups).sort((entity1, entity2) => {
    return entity1[0].localeCompare(entity2[0]);
  });

  // Sort group by createdAt in DESC order then flat groups
  const sortedTenants = sortedTenantsByFirstCharacterGroups.reduce((acc, group) => {
    acc = acc.concat(group[1].sort((tenant1, tenant2) => new Date(tenant2.createdAt).getTime() - new Date(tenant1.createdAt).getTime()));
    return acc;
  }, []);

  return sortedTenants;
};

export const checkTenantIsInSaleTime = (tenant: Tenant) => {
  if (!tenant.openedAt || !tenant.closedAt) {
    return null;
  }

  const now = new Date();
  return isAfterOrSameTime(now, tenant.openedAt) && isBeforeOrSameTime(now, tenant.closedAt);
};
