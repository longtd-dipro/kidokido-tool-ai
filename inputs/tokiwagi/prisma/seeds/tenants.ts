import { Tenant } from "@prisma/client";

export const tenantSeeds = [
  {
    code: "tokio_1",
    name: "Tokio 1",
    address: "Tokio 1 Address",
    servedUtil: new Date(0, 0, 1, 0, 22, 0, 0),
    closedAt: new Date(0, 0, 1, 0, 0, 0, 0),
    openedAt: new Date(0, 0, 1, 23, 59, 59, 59),
    createdAt: new Date(),
  } as unknown as Tenant,
  {
    code: "tokio_2",
    name: "Tokio 2",
    address: "Tokio 2 Address",
    servedUtil: new Date(0, 0, 1, 0, 22, 0, 0),
    closedAt: new Date(0, 0, 1, 0, 0, 0, 0),
    openedAt: new Date(0, 0, 1, 23, 59, 59, 59),
    createdAt: new Date(),
  } as unknown as Tenant
];
