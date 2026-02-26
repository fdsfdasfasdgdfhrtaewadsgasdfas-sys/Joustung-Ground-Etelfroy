import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, Swords } from "lucide-react";

export default async function LeaderboardPage({
    searchParams,
}: {
    searchParams: { q?: string; page?: string };
}) {
    const query = searchParams.q || "";
    const page = parseInt(searchParams.page || "1");
    const pageSize = 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let supabaseQuery = supabase
        .from('players')
        .select('*', { count: 'exact' })
        .order('rating', { ascending: false })
        .range(from, to);

    if (query) {
        supabaseQuery = supabaseQuery.ilike('nickname', `%${query}%`);
    }

    const { data: players, count, error } = await supabaseQuery;

    const totalPages = Math.ceil((count || 0) / pageSize);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black uppercase tracking-tight">Leaderboard</h1>
                    <p className="text-white/40">The official ranking of all jousters in the arena.</p>
                </div>

                <form className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        name="q"
                        defaultValue={query}
                        placeholder="Search by nickname..."
                        className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </form>
            </div>

            <div className="glass overflow-hidden rounded-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-[10px] uppercase font-bold tracking-widest text-white/40">
                            <th className="px-6 py-4">Rank</th>
                            <th className="px-6 py-4">Player</th>
                            <th className="px-6 py-4">Rating</th>
                            <th className="px-6 py-4">W/L</th>
                            <th className="px-6 py-4">Matches</th>
                            <th className="px-6 py-4 text-right">Profile</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {(players || []).map((player, index) => (
                            <tr key={player.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4">
                                    <span className={`font-black italic ${index + from < 3 ? 'text-primary' : 'text-white/20'}`}>
                                        #{index + from + 1}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-bold uppercase tracking-tight group-hover:text-primary transition-colors">
                                    {player.nickname}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-black text-white/80">{Math.round(player.rating)}</span>
                                </td>
                                <td className="px-6 py-4 text-xs font-mono">
                                    <span className="text-green-500">{player.wins}</span>
                                    <span className="mx-1 text-white/20">/</span>
                                    <span className="text-red-500">{player.losses}</span>
                                </td>
                                <td className="px-6 py-4 text-white/40 text-sm">
                                    {player.matches_played}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link href={`/players/${player.nickname}`} className="text-xs uppercase font-bold text-white/20 hover:text-primary transition-colors">
                                        View Stats
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-4 text-sm font-bold uppercase">
                    <Link
                        href={`?q=${query}&page=${Math.max(1, page - 1)}`}
                        className={`flex items-center gap-1 ${page === 1 ? 'pointer-events-none opacity-20' : 'hover:text-primary'}`}
                    >
                        <ChevronLeft className="w-4 h-4" /> Previous
                    </Link>
                    <span className="text-white/40">Page {page} of {totalPages}</span>
                    <Link
                        href={`?q=${query}&page=${Math.min(totalPages, page + 1)}`}
                        className={`flex items-center gap-1 ${page === totalPages ? 'pointer-events-none opacity-20' : 'hover:text-primary'}`}
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </div>
    );
}
