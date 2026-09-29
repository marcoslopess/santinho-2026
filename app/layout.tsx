import { DM_Sans, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ChunkLoadErrorHandler } from "@/components/chunk-load-error-handler";
import type { Metadata } from "next";
import { ContadorAcesso } from "@/components/contador-acesso";

export const dynamic = "force-dynamic";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const jakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-display" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Santinho 2026 — Monte sua lista de candidatos",
  description:
    "Monte seu santinho digital para as Eleições Gerais 2026. Busque candidatos por estado, cargo e partido. Salve seus favoritos e consulte no dia da votação.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Santinho 2026",
    description: "Monte seu santinho digital para as Eleições Gerais 2026.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${jakartaSans.variable} ${jetbrainsMono.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
          <ChunkLoadErrorHandler />
          <ContadorAcesso />
        </ThemeProvider>
      </body>
    </html>
  );
}
