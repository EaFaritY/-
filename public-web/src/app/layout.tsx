import type { Metadata } from "next";
import "@fontsource/noto-sans-thai/400.css";
import "@fontsource/noto-sans-thai/500.css";
import "@fontsource/noto-sans-thai/600.css";
import "@fontsource/noto-sans-thai/700.css";
import "./globals.css";
import { EVENT_NAME, SCHOOL_NAME } from "@/lib/theme";

export const metadata: Metadata = {
  title: EVENT_NAME,
  description: `ค้นหาผลการแข่งขันและใบเกียรติบัตรกีฬาสีของ${SCHOOL_NAME}`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-thai bg-[var(--color-bg)] text-[var(--color-text)]">
        {children}
      </body>
    </html>
  );
}
