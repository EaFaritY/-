import "dotenv/config";
import bcrypt from "bcryptjs";
import sharp from "sharp";
import { db } from "./index";
import { academicYears, admins, competitions, students, studentResults, certificates } from "./schema";
import { renderCertificateSvg } from "../lib/certificate-template";
import { saveCertificateFile } from "../lib/storage";
import { CURRENT_ACADEMIC_YEAR_BE } from "../lib/theme";

async function main() {
  console.log("Seeding database...");

  // --- Academic year -------------------------------------------------
  const [year] = await db
    .insert(academicYears)
    .values({ yearBe: CURRENT_ACADEMIC_YEAR_BE, isActive: true })
    .returning();
  console.log(`Created academic year ${year.yearBe} (active)`);

  // --- Admin -----------------------------------------------------------
  const passwordHash = await bcrypt.hash("admin2569", 10);
  const [admin] = await db
    .insert(admins)
    .values({ username: "admin", passwordHash, role: "admin", isActive: true })
    .returning();
  console.log(`Created admin user "${admin.username}" (password: admin2569)`);

  // --- Competitions ------------------------------------------------------
  const competitionSeeds = [
    { name: "วิ่ง 100 เมตร", sportType: "กรีฑา", category: "บุคคล", ageGroup: "ไม่เกิน 12 ปี", color: "สีแดง" },
    { name: "วิ่งผลัด 4x100 เมตร", sportType: "กรีฑา", category: "ทีม", ageGroup: "ไม่เกิน 12 ปี", color: "สีน้ำเงิน" },
    { name: "ฟุตบอล", sportType: "กีฬาสากล", category: "ทีม", ageGroup: "ไม่เกิน 15 ปี", color: "สีเขียว" },
    { name: "วอลเลย์บอล", sportType: "กีฬาสากล", category: "ทีม", ageGroup: "ไม่เกิน 15 ปี", color: "สีเหลือง" },
    { name: "ชักเย่อ", sportType: "กีฬาพื้นบ้าน", category: "ทีม", ageGroup: null, color: "สีแดง" },
    { name: "วิ่งเปี้ยว", sportType: "กีฬาพื้นบ้าน", category: "ทีม", ageGroup: "ไม่เกิน 12 ปี", color: "สีน้ำเงิน" },
    { name: "เปตอง", sportType: "กีฬาสากล", category: "บุคคล", ageGroup: null, color: "สีเขียว" },
    { name: "ว่ายน้ำ 50 เมตร", sportType: "กีฬาทางน้ำ", category: "บุคคล", ageGroup: "ไม่เกิน 15 ปี", color: "สีเหลือง" },
  ] as const;

  const insertedCompetitions = await db
    .insert(competitions)
    .values(competitionSeeds.map((c) => ({ ...c, academicYearId: year.id })))
    .returning();
  console.log(`Created ${insertedCompetitions.length} competitions`);
  const comp = (name: string) => insertedCompetitions.find((c) => c.name === name)!;

  // --- Students ------------------------------------------------------
  function normalize(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, "");
  }

  const studentSeeds = [
    { studentId: "10234", firstName: "ปิติภัทร", lastName: "ใจดี", class: "5", room: "1" },
    { studentId: "10235", firstName: "กานต์ธิดา", lastName: "แสงทอง", class: "5", room: "1" },
    { studentId: "10236", firstName: "ธนกฤต", lastName: "มั่นคง", class: "5", room: "2" },
    { studentId: "10237", firstName: "พิมพ์ชนก", lastName: "รุ่งเรือง", class: "6", room: "1" },
    { studentId: "10238", firstName: "อัครพล", lastName: "ทองสุข", class: "6", room: "1" },
  ] as const;

  const insertedStudents = await db
    .insert(students)
    .values(
      studentSeeds.map((s) => ({
        ...s,
        firstNameNormalized: normalize(s.firstName),
        lastNameNormalized: normalize(s.lastName),
        academicYearId: year.id,
      }))
    )
    .returning();
  console.log(`Created ${insertedStudents.length} students`);
  const student = (studentId: string) => insertedStudents.find((s) => s.studentId === studentId)!;

  // --- Results ------------------------------------------------------
  const resultSeeds = [
    { studentId: "10234", competition: "วิ่ง 100 เมตร", result: "winner" as const },
    { studentId: "10234", competition: "ฟุตบอล", result: "participated" as const },
    { studentId: "10235", competition: "วิ่ง 100 เมตร", result: "runner_up" as const },
    { studentId: "10235", competition: "เปตอง", result: "winner" as const },
    { studentId: "10236", competition: "ฟุตบอล", result: "second_runner_up" as const },
    { studentId: "10237", competition: "วอลเลย์บอล", result: "honorable_mention" as const },
    { studentId: "10237", competition: "ว่ายน้ำ 50 เมตร", result: "winner" as const },
    { studentId: "10238", competition: "ชักเย่อ", result: "participated" as const },
  ];

  const insertedResults = await db
    .insert(studentResults)
    .values(
      resultSeeds.map((r) => ({
        studentId: student(r.studentId).id,
        competitionId: comp(r.competition).id,
        result: r.result,
      }))
    )
    .returning();
  console.log(`Created ${insertedResults.length} student results`);

  function findResult(studentId: string, competitionName: string) {
    const s = student(studentId);
    const c = comp(competitionName);
    return insertedResults.find((r) => r.studentId === s.id && r.competitionId === c.id)!;
  }

  // --- Certificates (rasterized from the SVG template) ------------------
  const certificateSeeds = [
    { studentId: "10234", competition: "วิ่ง 100 เมตร", result: "winner" as const },
    { studentId: "10235", competition: "เปตอง", result: "winner" as const },
    { studentId: "10237", competition: "ว่ายน้ำ 50 เมตร", result: "winner" as const },
  ];

  for (const cert of certificateSeeds) {
    const s = student(cert.studentId);
    const c = comp(cert.competition);
    const result = findResult(cert.studentId, cert.competition);

    const svg = renderCertificateSvg({
      fullName: `${s.firstName} ${s.lastName}`,
      studentId: s.studentId,
      classRoom: `${s.class}/${s.room}`,
      competitionName: c.name,
      color: c.color,
      result: cert.result,
    });

    const jpegBuffer = await sharp(Buffer.from(svg)).jpeg({ quality: 90, mozjpeg: true }).toBuffer();
    const metadata = await sharp(jpegBuffer).metadata();
    const filename = `cert-${result.id}-seed.jpg`;
    const filePath = await saveCertificateFile(filename, jpegBuffer);

    await db.insert(certificates).values({
      studentResultId: result.id,
      filePath,
      fileType: "image/jpeg",
      originalFilename: filename,
      fileSizeBytes: jpegBuffer.length,
      widthPx: metadata.width ?? null,
      heightPx: metadata.height ?? null,
    });
    console.log(`Generated certificate for ${s.firstName} ${s.lastName} (${c.name})`);
  }

  console.log("Seeding complete.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
