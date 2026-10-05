-- Add smaregi_terminal_id: per-tenant Smaregi Device ID used when creating 確定販売 (confirmed sale)
-- transactions for prepaid bookings, replacing the virtual terminal id 999999999 for that flow.
ALTER TABLE "tenants" ADD COLUMN "smaregi_terminal_id" VARCHAR(100);
