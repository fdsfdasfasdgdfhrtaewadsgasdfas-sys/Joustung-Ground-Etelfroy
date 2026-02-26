import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Swords, Trophy, Shield, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

async function getPlayerData(nickname: string) {
    const { data: player, error } = await supabase
        .from('players')
        .select('*')
        .eq('nickname', nickname)
        .single();

    if (error || !player) return null;

    const { data: matches } = await supabase
        .from('matches')
        .select('*, player_a:players!player_a_id(nickname), player_b:players!player_b_id(nickname)')
        .or(`player_a_id.eq.${player.id},player_b_id.eq.${player.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

    return { player, matches };
}

export default async function PlayerProfilePage({ params }: { params: { nickname: string } }) {
    const data = await getPlayerData(params.nickname);

    if (!data) notFound();

    const { player, matches } = data;
    const winRate = player.matches_played > 0
        ? Math.round((player.wins / player.matches_played) * 100)
        : 0;

    return (
        <div className="space-y-12 animate-fade-in py-8">
            {/* Profile Header */}
            <header className="flex flex-col md:flex-row gap-8 items-start justify-between">
                <div className="space-y-4">
                    <Link href="/leaderboard" className="text-xs uppercase font-bold tracking-widest text-white/40 hover:text-primary flex items-center gap-2">
                        &lsaquo; Back to Leaderboard
                    </Link>
                    <div className="space-y-1">
                        <p className="text-primary font-black uppercase tracking-[0.2em] text-xs">Arena Competitor</p>
                        <h1 className="text-6xl font-black uppercase tracking-tighter italic">{player.nickname}</h1>
                    </div>
                    <div className="flex gap-4">
                        <div className="glass px-6 py-2 rounded-full border-primary/20">
                            <span className="text-primary font-black italic text-xl"># {Math.round(player.rating)}</span>
                            <span className="text-[10px] uppercase font-bold ml-2 text-white/40 tracking-widest">Rating</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                    <div className="glass p-6 text-center rounded-3xl min-w-[120px]">
                        <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Win Rate</p>
                        <p className="text-3xl font-black italic">{winRate}%</p>
                    </div>
                    <div className="glass p-6 text-center rounded-3xl min-w-[120px]">
                        <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Matches</p>
                        <p className="text-3xl font-black italic">{player.matches_played}</p>
                    </div>
                </div>
            </header>

            {/* Stats Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-8 space-y-2 border-l-4 border-green-500/50">
                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Victories</p>
                    <h2 className="text-4xl font-black italic text-green-500">{player.wins}</h2>
                </div>
                <div className="glass p-8 space-y-2 border-l-4 border-red-500/50">
                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Defeats</p>
                    <h2 className="text-4xl font-black italic text-red-500">{player.losses}</h2>
                </div>
                <div className="glass p-8 space-y-2 border-l-4 border-primary/50">
                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Rank Tier</p>
                    <h2 className="text-4xl font-black italic text-primary">MASTER</h2>
                </div>
            </section>

            {/* Match History */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <Swords className="text-primary w-6 h-6" />
                    <h2 className="text-2xl font-bold uppercase tracking-tight">Recent Matches</h2>
                </div>

                <div className="space-y-4">
                    {(matches || []).map((match: any) => {
                        const isWinner = match.winner_id === player.id;
                        const opponent = match.player_a_id === player.id ? match.player_b.nickname : match.player_a.nickname;
                        const ratingChange = match.player_a_id === player.id
                            ? match.rating_a_after - match.rating_a_before
                            : match.rating_b_after - match.rating_b_before;

                        return (
                            <div key={match.id} className={`glass p-5 rounded-2xl flex items-center justify-between border-l-2 ${isWinner ? 'border-green-500/30' : 'border-red-500/30'}`}>
                                <div className="flex items-center gap-6">
                                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold italic text-sm ${isWinner ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {isWinner ? 'WIN' : 'LOSS'}
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Against</p>
                                        <Link href={`/players/${opponent}`} className="text-lg font-bold group hover:text-primary transition-colors">
                                            {opponent} <ExternalLink className="inline-block w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                                        </Link>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">{format(new Date(match.created_at), 'MMM dd, HH:mm')}</p>
                                    <p className={`font-black italic text-xl ${ratingChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {ratingChange >= 0 ? '+' : ''}{Math.round(ratingChange)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    {!matches?.length && <p className="text-white/20 italic italic py-12 text-center glass rounded-2xl">No recorded matches found.</p>}
                </div>
            </section>
        </div>
    );
}
