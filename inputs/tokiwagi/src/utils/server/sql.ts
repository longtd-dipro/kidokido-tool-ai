import { Booking, Prisma, PrismaClient } from "@prisma/client";

export const convertToRawQueryRecordToPrismaModel = <T>(object: any, modelName: string, removeAdditionalFields = false, mappedPrefix = ""): T => {
  const fields = Prisma.dmmf.datamodel.models.find(model => model.name === modelName).fields;
  const fieldsMap = fields.reduce((acc, field) => {
    acc[field.dbName || field.name] = field.name;
    return acc;
  }, {});
  const entity: T = {} as T;
  Object.keys(object).forEach((key) => {
    const objectField = key.replace(mappedPrefix, "");
    if (removeAdditionalFields && !fieldsMap[objectField]) {
      return;
    }
    const entityField = fieldsMap[objectField] || objectField;
    entity[entityField] = object[key];
  });
  return entity;
};

export const generateLockingBookingsSQL = (ids: number[]) => {
  if (ids?.length) {
    return Prisma.sql([
      `
          SELECT 
            "b".*,
            
            "t"."id" as "ticket_id", 
            "t"."name" as "ticket_name",
            "t"."tenant_code" as "ticket_tenant_code", 
            "t"."video_url" as "ticket_video_url",
            "t"."visibility" as "ticket_visibility", 
            "t"."payment_type" as "ticket_payment_type", 
            "t"."ticket_type" as "ticket_ticket_type", 
            "t"."can_book_in_advance" as "ticket_can_book_in_advance",
            "t"."child_age_limit_from" as "ticket_child_age_limit_from", 
            "t"."child_age_limit_to" as "ticket_child_age_limit_to", 
            "t"."max_child_per_adult" as "ticket_max_child_per_adult",
            "t"."adult_ticket_code" as "ticket_adult_ticket_code", 
            "t"."child_ticket_code" as "ticket_child_ticket_code", 
            "t"."display_order" as "ticket_display_order",
            "t"."is_promotion" as "ticket_is_promotion", 
            "t"."created_at" as "ticket_created_at", 
            "t"."updated_at" as "ticket_updated_at",
            "t"."master_ticket_id" as "ticket_master_ticket_id", 
            "t"."group_id" as "ticket_group_id",
            
            "ten"."code" as "tenant_code", 
            "ten"."name" as "tenant_name", 
            "ten"."image_url" as "tenant_image_url", 
            "ten"."site_url" as "tenant_site_url",
            "ten"."post_code" as "tenant_post_code", 
            "ten"."province" as "tenant_province", 
            "ten"."address" as "tenant_address", 
            "ten"."guide" as "tenant_guide",
            "ten"."phone" as "tenant_phone", 
            "ten"."opened_at" as "tenant_opened_at", 
            "ten"."closed_at" as "tenant_closed_at", 
            "ten"."served_util" as "tenant_served_util",
            "ten"."active" as "tenant_active", 
            "ten"."note" as "tenant_note", 
            "ten"."gmo_id" as "tenant_gmo_id", 
            "ten"."created_at" as "tenant_created_at", 
            "ten"."updated_at" as "tenant_updated_at",
            "ten"."deleted" as "tenant_deleted",
            
            "u"."id" as "user_id", 
            "u"."name" as "user_name", 
            "u"."first_name" as "user_first_name", 
            "u"."last_name" as "user_last_name",
            "u"."first_name_furigana" as "user_first_name_furigana", 
            "u"."last_name_furigana" as "user_last_name_furigana", 
            "u"."email" as "user_email", 
            "u"."email_verified" as "user_email_verified",
            "u"."image" as "user_image", 
            "u"."role" as "user_role", 
            "u"."phone" as "user_phone", 
            "u"."post_code" as "user_post_code",
            "u"."province" as "user_province", 
            "u"."address" as "user_address", 
            "u"."birthday" as "user_birthday", 
            "u"."gender" as "user_gender",
            "u"."allowed_newsletter" as "user_allowed_newsletter", 
            "u"."is_blacklist" as "user_is_blacklist", 
            "u"."login_attempts" as "user_login_attempts", 
            "u"."locked" as "user_locked",
            "u"."first_checked_out_booking_id" as "user_first_checked_out_booking_id", 
            "u"."created_at" as "user_created_at", 
            "u"."updated_at" as "user_updated_at",
            "u"."deleted" as "user_deleted", 
            "u"."deleted_at" as "user_deleted_at", 
            "u"."deleted_by" as "user_deleted_by"
          
          FROM "bookings" as "b"
          LEFT JOIN "tickets" as "t" ON "b"."ticket_id" = "t"."id"
          LEFT JOIN "tenants" as "ten" ON "t"."tenant_code" = "ten"."code"
          LEFT JOIN "users" as "u" ON "b"."user_id" = "u"."id"
          WHERE "b"."id" IN (${ids.join(",")})
              FOR UPDATE OF "b" SKIP LOCKED;
      `,
    ]);
  }
};

export const selectBookingsForUpdate = async (prisma: PrismaClient, ids: number[]): Promise<Booking[]> => {
  const rows: any[] = await prisma.$queryRaw(generateLockingBookingsSQL(ids));
  return rows.map(row => ({
    ...convertToRawQueryRecordToPrismaModel(row, "Booking", true),
    User: convertToRawQueryRecordToPrismaModel(row, "User", true, "user_"),
    Tenant: convertToRawQueryRecordToPrismaModel(row, "Tenant", true, "tenant_"),
    Ticket: convertToRawQueryRecordToPrismaModel(row, "Ticket", true, "ticket_"),
  }));
};