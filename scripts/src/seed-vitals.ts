import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { vitalsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 0, 0, 0);
  return d;
};

const vitalsData = [
  { daysAgo: 13, heartRate: 72, systolicBp: 112, diastolicBp: 70, spo2: 98, temperature: 36.2, glucose: 92 },
  { daysAgo: 12, heartRate: 78, systolicBp: 118, diastolicBp: 75, spo2: 97, temperature: 36.4, glucose: 105 },
  { daysAgo: 11, heartRate: 85, systolicBp: 125, diastolicBp: 80, spo2: 96, temperature: 36.6, glucose: 118 },
  { daysAgo: 10, heartRate: 68, systolicBp: 108, diastolicBp: 65, spo2: 99, temperature: 36.8, glucose: 88 },
  { daysAgo: 9,  heartRate: 91, systolicBp: 130, diastolicBp: 84, spo2: 95, temperature: 37.0, glucose: 135 },
  { daysAgo: 8,  heartRate: 75, systolicBp: 116, diastolicBp: 72, spo2: 98, temperature: 36.5, glucose: 99 },
  { daysAgo: 7,  heartRate: 82, systolicBp: 122, diastolicBp: 78, spo2: 97, temperature: 36.3, glucose: 110 },
  { daysAgo: 6,  heartRate: 69, systolicBp: 110, diastolicBp: 68, spo2: 99, temperature: 36.7, glucose: 94 },
  { daysAgo: 5,  heartRate: 88, systolicBp: 128, diastolicBp: 82, spo2: 96, temperature: 36.9, glucose: 128 },
  { daysAgo: 4,  heartRate: 74, systolicBp: 114, diastolicBp: 71, spo2: 98, temperature: 36.4, glucose: 101 },
  { daysAgo: 3,  heartRate: 80, systolicBp: 120, diastolicBp: 76, spo2: 97, temperature: 36.6, glucose: 115 },
  { daysAgo: 2,  heartRate: 77, systolicBp: 115, diastolicBp: 73, spo2: 99, temperature: 36.2, glucose: 96 },
  { daysAgo: 1,  heartRate: 93, systolicBp: 132, diastolicBp: 86, spo2: 95, temperature: 36.8, glucose: 142 },
  { daysAgo: 0,  heartRate: 71, systolicBp: 109, diastolicBp: 67, spo2: 98, temperature: 37.1, glucose: 87 },
];

async function main() {
  const [patient] = await db.select().from(usersTable).where(eq(usersTable.email, "patient@demo.com"));
  if (!patient) {
    console.error("patient@demo.com not found — register them first");
    process.exit(1);
  }

  // Remove today's duplicate records first
  await db.delete(vitalsTable).where(eq(vitalsTable.userId, patient.id));
  console.log(`Cleared existing vitals for user ${patient.id}`);

  for (const v of vitalsData) {
    const createdAt = daysAgo(v.daysAgo);
    const status =
      v.heartRate > 100 || v.systolicBp > 140 || v.spo2 < 94 ? "critical"
      : v.heartRate > 90 || v.systolicBp > 130 ? "risk"
      : "normal";

    await db.insert(vitalsTable).values({
      userId: patient.id,
      heartRate: v.heartRate,
      systolicBp: v.systolicBp,
      diastolicBp: v.diastolicBp,
      spo2: v.spo2,
      temperature: v.temperature,
      glucose: v.glucose,
      status,
      createdAt,
    });
    console.log(`Inserted vitals for ${createdAt.toDateString()} — HR:${v.heartRate} BP:${v.systolicBp}/${v.diastolicBp} SpO2:${v.spo2} Temp:${v.temperature} Glu:${v.glucose} [${status}]`);
  }

  console.log("\n✓ 14 days of vitals seeded successfully");
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
