import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Trophy, Swords, Shield, Search } from "lucide-react";

export const revalidate = 60; // Revalidate every minute

async function getTopPlayers() {
    const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('rating', { ascending: false })
        .limit(10);

    if (error) return [];
    return data;
}

export default async function Home() {
    const players = await getTopPlayers();

    return (
        <div className="space-y-16 py-12">
            {/* Hero Section */}
            <section className="text-center space-y-6 animate-fade-in">
                <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white uppercase leading-none">
                    Honor <span className="text-primary italic">is earned</span> on the saddle
                </h1>
                <p className="text-xl text-white/60 max-w-2xl mx-auto font-light">
                    The official competitive rating system for the premier Minecraft Jousting Arena.
                    Challenge your peers, climb the ranks, and become a legend.
                </p>
                <div className="flex justify-center gap-4 pt-4">
                    <Link href="/leaderboard" className="bg-primary text-black px-8 py-3 rounded-none font-bold hover:bg-white transition-all uppercase skew-x-[-12deg]">
                        <span className="inline-block skew-x-[12deg]">View Leaderboard</span>
                    </Link>
                    <Link href="/matches" className="glass px-8 py-3 rounded-none font-bold hover:bg-white/10 transition-all uppercase skew-x-[-12deg]">
                        <span className="inline-block skew-x-[12deg]">Match History</span>
                    </Link>
                </div>
            </section>

            {/* Top 10 Leaderboard Brief */}
            <section className="space-y-8">
                <div className="flex items-center gap-3">
                    <Trophy className="text-primary w-8 h-8" />
                    <h2 className="text-3xl font-bold uppercase tracking-tight">Top Champions</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {players.map((player, index) => (
                        <Link
                            key={player.id}
                            href={`/players/${player.nickname}`}
                            className="glass p-6 group hover:translate-y-[-4px] transition-all relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 font-black text-6xl text-white/5 italic">
                                #{index + 1}
                            </div>
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <p className="text-white/40 text-xs uppercase font-bold tracking-widest mb-1">Champion</p>
                                    <h3 className="text-2xl font-black uppercase text-white group-hover:text-primary transition-colors">
                                        {player.nickname}
                                    </h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-primary text-3xl font-black italic leading-none">{Math.round(player.rating)}</p>
                                    <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest mt-1">ELO RATING</p>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-4 text-xs font-bold uppercase text-white/40">
                                <span className="flex items-center gap-1"><Swords className="w-3 h-3" /> {player.wins}W</span>
                                <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {player.losses}L</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Quick Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass p-10 space-y-4 rounded-3xl">
                    <div className="bg-primary/20 p-3 rounded-full w-fit">
                        <Swords className="text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">Fair Competiton</h3>
                    <p className="text-white/60">Our Elo system uses dynamic K-factors to ensure fair skill progression for both new and veteran jousters.</p>
                </div>
                <div className="glass p-10 space-y-4 rounded-3xl">
                    <div className="bg-primary/20 p-3 rounded-full w-fit">
                        <Shield className="text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">Judge Verified</h3>
                    <p className="text-white/60">Every match is observed and entered by official arena judges to maintain the highest integrity of the sport.</p>
                </div>
            </section>
        </div>
    );
}
