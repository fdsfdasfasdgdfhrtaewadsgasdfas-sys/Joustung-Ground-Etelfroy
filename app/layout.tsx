import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Jousting Arena | Player Ratings",
    description: "Official leaderboard and match history for the Minecraft Jousting Arena.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} min-h-screen flex flex-col`}>
                <nav className="glass sticky top-0 z-50 border-b border-white/10 px-6 py-4">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <Link href="/" className="text-2xl font-bold gold-glow text-primary hover:scale-105 transition-transform">
                            JOUST ARENA
                        </Link>
                        <div className="space-x-8 text-sm font-medium uppercase tracking-wider">
                            <Link href="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link>
                            <Link href="/matches" className="hover:text-primary transition-colors">Match History</Link>
                            <Link href="/ranks" className="hover:text-primary transition-colors">Ranks</Link>
                            <Link href="/admin" className="px-4 py-2 border border-primary/30 rounded-md hover:bg-primary/10 transition-all">Judge Portal</Link>
                        </div>
                    </div>
                </nav>
                <main className="flex-grow max-w-7xl mx-auto w-full p-6">
                    {children}
                </main>
                <footer className="py-12 border-t border-white/5 text-center text-sm text-white/40">
                    <p>© 2024 Minecraft Jousting Arena. All rights reserved.</p>
                </footer>
            </body>
        </html>
    );
}
