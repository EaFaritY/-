import { Users, Trophy, Image as ImageIcon, Award, Search, Clock } from "lucide-react";
import { getDashboardStats } from "@/lib/dashboard";
import StatCard from "./StatCard";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--color-text)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {stats.academicYearBe ? `ปีการศึกษา ${stats.academicYearBe}` : "ยังไม่ได้ตั้งค่าปีการศึกษาที่ใช้งาน"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="นักเรียนทั้งหมด" value={stats.totalStudents} icon={Users} />
        <StatCard label="นักเรียนที่ได้รับรางวัล" value={stats.studentsWithAward} icon={Award} />
        <StatCard label="รายการแข่งขันทั้งหมด" value={stats.totalCompetitions} icon={Trophy} />
        <StatCard label="ใบเกียรติบัตรทั้งหมด" value={stats.totalCertificates} icon={ImageIcon} />
        <StatCard label="จำนวนการค้นหาวันนี้" value={stats.searchesToday} icon={Search} />
        <StatCard label="เพิ่มล่าสุด" value={stats.lastAdded} icon={Clock} />
      </div>
    </div>
  );
}
