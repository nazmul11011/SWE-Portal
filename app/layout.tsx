import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css";

// Sans-serif (main text)
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Monospace (code blocks, etc.)
const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Student Dashboard",
  description:
    "A centralized student dashboard for the Department of Software Engineering, Shahjalal University of Science and Technology (SUST). Access course details, grades, and academic resources in one place.",
  keywords: [
    "Student Dashboard",
    "Software Engineering",
    "SWE", "SUST",
    "Shahjalal University of Science and Technology",
    "Course Management",
    "Academic Portal",
  ],
  authors: [{ name: "Department of Software Engineering, SUST" }],
  openGraph: {
    title: "Student Dashboard",
    description:
      "Access your academic records, course information, and departmental updates on the SUST Software Engineering Student Dashboard.",
    url: "https://dash-swe.onrender.com",
    siteName: "Student Dashboard",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${firaCode.variable} antialiased`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Toaster />
      </body>
    </html>
  );
}
