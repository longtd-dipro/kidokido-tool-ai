import prisma from "utils/db";

export async function checkExistingTenantCode(code: string): Promise<boolean> {
  const tenant = await prisma.tenant.findFirst({
    where: {
      code,
      deleted: { not: null },
    },
  });

  return !!tenant;
}
