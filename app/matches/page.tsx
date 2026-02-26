import { supabase } from "@/lib/supabase";
import { Swords, Calendar, Search, User } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function MatchHistoryPage({
    searchParams,
}: {
    searchParams: { q?: string; page?: string };
}) {
    const query = searchParams.q || "";
    const page = parseInt(searchParams.page || "1");
    const pageSize = 30;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let supabaseQuery = supabase
        .from('matches')
        .select('*, player_a:players!player_a_id(nickname), player_b:players!player_b_id(nickname)', { count: 'exact' })
        .eq('is_void', false)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (query) {
        // Note: Complex filtering in Supabase across joins can be tricky
        // For simplicity, we filter by player_a or player_b nickname via OR
        supabaseQuery = supabaseQuery.or(`player_a.nickname.ilike.%${query}%,player_b.nickname.ilike.%${query}%`);
    }

    const { data: matches, count, error } = await supabaseQuery;
    const totalPages = Math.ceil((count || 0) / pageSize);

    return (
        <div className="space-y-8 animate-fade-in py-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black uppercase tracking-tight">Arena History</h1>
                    <p className="text-white/40">Recent jousts and battle results from the arena.</p>
                </div>

                <form className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        name="q"
                        defaultValue={query}
                        placeholder="Filter by player..."
                        className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-primary/50 transition-colors text-sm font-medium"
                    />
                </form>
            </div>

            <div className="space-y-4">
                {(matches || []).map((match: any) => {
                    const winnerNick = match.winner_id === match.player_a_id ? match.player_a.nickname : match.player_b.nickname;

                    return (
                        <div key={match.id} className="glass group hover:bg-white/[0.04] transition-all rounded-3xl overflow-hidden border border-white/5">
                            <div className="flex flex-col md:flex-row items-center gap-8 p-6">
                                {/* Timestamp */}
                                <div className="flex flex-col items-center justify-center text-center md:border-r border-white/10 md:pr-8 min-w-[100px]">
                                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em] mb-1">Date</p>
                                    <p className="font-black italic text-sm">{format(new Date(match.created_at), 'MMM dd')}</p>
                                    <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest">{format(new Date(match.created_at), 'HH:mm')}</p>
                                </div>

                                {/* Match Result */}
                                <div className="flex-grow flex items-center justify-center gap-4 md:gap-12 w-full">
                                    <div className={`flex flex-col items-end text-right w-1/3 ${match.winner_id === match.player_a_id ? 'text-primary' : 'text-white/40'}`}>
                                        <Link href={`/players/${match.player_a.nickname}`} className="text-xl md:text-2xl font-black uppercase italic hover:underline truncate w-full">
                                            {match.player_a.nickname}
                                        </Link>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">{Math.round(match.rating_a_before)} &rarr; {Math.round(match.rating_a_after)}</p>
                                    </div>

                                    <div className="flex flex-col items-center gap-2">
                                        <div className="bg-white/5 p-3 rounded-full">
                                            <Swords className="w-5 h-5 text-white/20" />
                                        </div>
                                        <span className="text-[10px] font-black italic tracking-widest text-white/20">VS</span>
                                    </div>

                                    <div className={`flex flex-col items-start text-left w-1/3 ${match.winner_id === match.player_b_id ? 'text-primary' : 'text-white/40'}`}>
                                        <Link href={`/players/${match.player_b.nickname}`} className="text-xl md:text-2xl font-black uppercase italic hover:underline truncate w-full">
                                            {match.player_b.nickname}
                                        </Link>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">{Math.round(match.rating_b_before)} &rarr; {Math.round(match.rating_b_after)}</p>
                                    </div>
                                </div>

                                {/* Outcome Badge */}
                                <div className="md:border-l border-white/10 md:pl-8 flex flex-col items-center md:items-end min-w-[120px]">
                                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em] mb-1">Victor</p>
                                    <p className="text-primary font-black uppercase italic text-sm truncate max-w-[100px]">{winnerNick}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {!matches?.length && (
                    <div className="glass py-24 rounded-3xl text-center space-y-4">
                        <Swords className="w-12 h-12 text-white/10 mx-auto" />
                        <p className="text-white/20 font-bold uppercase tracking-widest italic">The chronicles are empty...</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-8">
                    <Link
                        href={`?q=${query}&page=${Math.max(1, page - 1)}`}
                        className={`glass px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-full ${page === 1 ? 'pointer-events-none opacity-20' : 'hover:bg-white/10 transition-colors'}`}
                    >
                        Back
                    </Link>
                    <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Page {page} of {totalPages}</span>
                    <Link
                        href={`?q=${query}&page=${Math.min(totalPages, page + 1)}`}
                        className={`glass px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-full ${page === totalPages ? 'pointer-events-none opacity-20' : 'hover:bg-white/10 transition-colors'}`}
                    >
                        Next
                    </Link>
                </div>
            )}
        </div>
    );
}
