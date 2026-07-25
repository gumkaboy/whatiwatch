import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/app/actions";
import { ScrollGradient } from "@/components/ScrollGradient";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "whatiwatch",
  description: "Личный трекер сериалов",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ScrollGradient />
        <div className="bg-gradient" />
        <div className="bg-gradient-overlay" />
        <header className="site-header">
          <nav className="site-nav">
            <div className="site-nav-links">
              {session?.user ? (
                <>
                  <Link href="/search">Поиск</Link>
                  <Link href="/library">Моя библиотека</Link>
                  <Link href="/profile" className="site-nav-email">
                    {session.user.name}
                  </Link>
                  <form action={signOutAction} style={{ display: "inline" }}>
                    <button type="submit" className="site-nav-signout">
                      Выйти
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login">Вход</Link>
                  <Link href="/register">Регистрация</Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <main className="site-main">{children}</main>
      </body>
    </html>
  );
}
