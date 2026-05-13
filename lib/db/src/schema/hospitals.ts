import { pgTable, text, serial, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const hospitalsTable = pgTable("hospitals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  specialties: text("specialties").array().notNull().default([]),
  bedsAvailable: integer("beds_available").notNull().default(0),
  icuAvailable: integer("icu_available").notNull().default(0),
  rating: real("rating"),
  distance: text("distance"),
});

export const insertHospitalSchema = createInsertSchema(hospitalsTable).omit({ id: true });
export type InsertHospital = z.infer<typeof insertHospitalSchema>;
export type Hospital = typeof hospitalsTable.$inferSelect;
