'use client';

import { useState, useEffect } from 'react';
import { editPlayerRatingAction } from '../actions';
import { createSupabaseClient } from '@/lib/supabase';
import { ShieldAlert, Search, User, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function RatingEditorPage() {
    const [query, setQuery] = useState('');
    const [players, setPlayers] = useState<any[]>([]);
    const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
    const [newRating, setNewRating] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const supabase = createSupabaseClient();

    useEffect(() => {
        if (query.length > 1) {
            searchPlayers();
        } else {
            setPlayers([]);
        }
    }, [query]);

    async function searchPlayers() {
        const { data } = await supabase
            .from('players')
            .select('*')
            .ilike('nickname', `%${query}%`)
            .limit(5);
        setPlayers(data || []);
    }

    async function handleEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedPlayer || !newRating || !reason) return;

        setLoading(true);
        const result = await editPlayerRatingAction(selectedPlayer.id, parseFloat(newRating), reason);
        setLoading(false);

        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setMessage({ type: 'success', text: `Successfully updated ${selectedPlayer.nickname}'s rating.` });
            setSelectedPlayer(null);
            setNewRating('');
            setReason('');
            setQuery('');
        }
    }

    return (
        <div className="max-w-2xl space-y-8 animate-fade-in">
            <header className="space-y-2">
                <h1 className="text-3xl font-black uppercase italic tracking-tight flex items-center gap-3">
                    <ShieldAlert className="text-primary" />
                    Rating Overseer
                </h1>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Manual correction of player ratings. All actions are logged.</p>
            </header>

            <section className="glass p-8 rounded-[2rem] space-y-6">
                {!selectedPlayer ? (
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search for player to edit..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:border-primary/50 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            {players.map(player => (
                                <button
                                    key={player.id}
                                    onClick={() => setSelectedPlayer(player)}
                                    className="w-full flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/5 rounded-xl border border-white/5 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <User size={16} className="text-white/20" />
                                        <span className="font-bold uppercase italic">{player.nickname}</span>
                                    </div>
                                    <span className="text-primary font-black italic">{Math.round(player.rating)}</span>
                                </button>
                            ))}
                            {query.length > 1 && players.length === 0 && (
                                <p className="text-center text-white/20 py-4 italic text-sm">No players found matching "{query}"</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleEdit} className="space-y-6">
                        <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/20 p-2 rounded-lg">
                                    <User size={16} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">Editing Player</p>
                                    <p className="font-black uppercase italic">{selectedPlayer.nickname}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedPlayer(null)}
                                className="text-white/20 hover:text-white transition-colors p-2"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-4">Current Rating</label>
                                <div className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-6 text-white/40 font-black italic">
                                    {Math.round(selectedPlayer.rating)}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-4">New Rating</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newRating}
                                    onChange={(e) => setNewRating(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-6 focus:outline-none focus:border-primary/50 transition-all font-black italic text-primary"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-4">Reason for correction</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g. Tournament adjustment, server rollback correction..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-primary/50 transition-all text-sm h-24 resize-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-black font-black uppercase italic py-4 rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Apply Rating Change'}
                        </button>
                    </form>
                )}

                {message && (
                    <div className={`p-4 rounded-2xl border flex items-center gap-3 font-bold uppercase text-[10px] tracking-widest ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        {message.text}
                    </div>
                )}
            </section>

            <div className="glass p-6 rounded-3xl border-l-4 border-yellow-500/30">
                <p className="text-xs text-white/60 leading-relaxed">
                    <strong className="text-yellow-500 uppercase tracking-widest mr-2 underline">Warning:</strong>
                    Manual edits bypass the Elo algorithm and can create inconsistencies in global standings. Use only for data correction.
                </p>
            </div>
        </div>
    );
}
