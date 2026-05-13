import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vitalsTable = pgTable("vitals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  heartRate: real("heart_rate").notNull(),
  systolicBp: real("systolic_bp").notNull(),
  diastolicBp: real("diastolic_bp").notNull(),
  spo2: real("spo2").notNull(),
  glucose: real("glucose").notNull(),
  temperature: real("temperature").notNull(),
  status: text("status").notNull().default("normal"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVitalSchema = createInsertSchema(vitalsTable).omit({ id: true, createdAt: true });
export type InsertVital = z.infer<typeof insertVitalSchema>;
export type Vital = typeof vitalsTable.$inferSelect;
