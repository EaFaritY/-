import { redirect } from "next/navigation";

// This site is admin-only. The public search site is a separate app.
export default function HomePage() {
  redirect("/admin");
}
