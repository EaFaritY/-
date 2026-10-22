import { NextRequest, NextResponse } from "next/server";
import { searchStudents } from "@/lib/search";

// JSON search endpoint — kept alongside the server-rendered /result page for
// any future client-side/typeahead search UI, and as a thin integration
// point if this ever needs to serve a mobile app or other non-browser client.
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const studentId = sp.get("studentId") ?? "";
  const firstName = sp.get("firstName") ?? "";
  const lastName = sp.get("lastName") ?? "";
  const classRoom = sp.get("classRoom") ?? "";

  if (!studentId && !firstName && !lastName && !classRoom) {
    return NextResponse.json({ error: "กรุณาระบุข้อมูลอย่างน้อย 1 ช่อง" }, { status: 400 });
  }

  const results = await searchStudents({ studentId, firstName, lastName, classRoom });
  return NextResponse.json({ results });
}
