import type { Metadata } from "next";
import { Fira_Code } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/Toaster";

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Red Pine OS Dashboard",
  description: "Interactive business dashboard powered by Red Pine OS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <head>
        {/* Core fonts — loaded immediately (5 most popular) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${firaCode.variable} h-full overflow-hidden`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
