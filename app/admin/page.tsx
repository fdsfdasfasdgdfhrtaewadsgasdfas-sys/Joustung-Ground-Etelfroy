'use client';

import { useState, useEffect } from 'react';
import { submitMatchAction, undoMatchAction } from './actions';
import { createSupabaseClient } from '@/lib/supabase';
import { Swords, RotateCcw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
    const [playerA, setPlayerA] = useState('');
    const [playerB, setPlayerB] = useState('');
    const [winner, setWinner] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [lastMatch, setLastMatch] = useState<any>(null);

    const supabase = createSupabaseClient();

    useEffect(() => {
        fetchLastMatch();
    }, []);

    async function fetchLastMatch() {
        const { data } = await supabase
            .from('matches')
            .select('*, player_a:players!player_a_id(nickname), player_b:players!player_b_id(nickname)')
            .eq('is_void', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        setLastMatch(data);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (playerA === playerB) {
            setMessage({ type: 'error', text: 'Players must be different!' });
            return;
        }
        if (!winner) {
            setMessage({ type: 'error', text: 'Select a winner!' });
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('playerA', playerA);
        formData.append('playerB', playerB);
        formData.append('winner', winner);

        const result = await submitMatchAction(formData);
        setLoading(false);

        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setMessage({ type: 'success', text: 'Match submitted successfully!' });
            setPlayerA('');
            setPlayerB('');
            setWinner('');
            fetchLastMatch();
        }
    }

    async function handleUndo() {
        if (!lastMatch) return;
        if (!confirm(`Are you sure you want to undo the match: ${lastMatch.player_a.nickname} vs ${lastMatch.player_b.nickname}?`)) return;

        setLoading(true);
        const result = await undoMatchAction(lastMatch.id);
        setLoading(false);

        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setMessage({ type: 'success', text: 'Match voided successfully.' });
            fetchLastMatch();
        }
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="space-y-2">
                <h1 className="text-3xl font-black uppercase italic tracking-tight">Arena Control</h1>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Enter match results to update the scrolls.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Match Form */}
                <section className="glass p-8 rounded-[2rem] space-y-6">
                    <div className="flex items-center gap-3">
                        <Swords className="text-primary w-5 h-5" />
                        <h2 className="text-xl font-bold uppercase tracking-tight">Record Joust</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-4">Player A</label>
                                <input
                                    type="text"
                                    value={playerA}
                                    onChange={(e) => setPlayerA(e.target.value)}
                                    placeholder="Nickname"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-6 focus:outline-none focus:border-primary/50 transition-all font-medium"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-4">Player B</label>
                                <input
                                    type="text"
                                    value={playerB}
                                    onChange={(e) => setPlayerB(e.target.value)}
                                    placeholder="Nickname"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-6 focus:outline-none focus:border-primary/50 transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 text-center">Select Winner</p>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setWinner(playerA)}
                                    className={`flex-1 py-4 rounded-2xl font-black uppercase italic transition-all ${winner === playerA && playerA ? 'bg-primary text-black border-primary' : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10'}`}
                                    disabled={!playerA}
                                >
                                    {playerA || 'Player A'}
                                </button>
                                <div className="flex items-center text-white/10 font-black italic">VS</div>
                                <button
                                    type="button"
                                    onClick={() => setWinner(playerB)}
                                    className={`flex-1 py-4 rounded-2xl font-black uppercase italic transition-all ${winner === playerB && playerB ? 'bg-primary text-black border-primary' : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10'}`}
                                    disabled={!playerB}
                                >
                                    {playerB || 'Player B'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !playerA || !playerB || !winner}
                            className="w-full bg-white text-black font-black uppercase italic py-4 rounded-2xl hover:bg-primary transition-all flex items-center justify-center gap-2 group disabled:opacity-30"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Result'}
                        </button>
                    </form>

                    {message && (
                        <div className={`p-4 rounded-2xl border flex items-center gap-3 font-bold uppercase text-[10px] tracking-widest ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            {message.text}
                        </div>
                    )}
                </section>

                {/* Quick Undo / Recent */}
                <section className="space-y-6">
                    <div className="glass p-8 rounded-[2rem] space-y-6 bg-gradient-to-br from-red-500/[0.03] to-transparent border-red-500/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <RotateCcw className="text-red-400 w-5 h-5" />
                                <h2 className="text-xl font-bold uppercase tracking-tight">Undo Match</h2>
                            </div>
                        </div>

                        {lastMatch ? (
                            <div className="space-y-4">
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/20">Last Recorded Joust</span>
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">{format(new Date(lastMatch.created_at), 'HH:mm')}</span>
                                    </div>
                                    <div className="flex items-center justify-between font-black uppercase italic text-lg">
                                        <span className={lastMatch.winner_id === lastMatch.player_a_id ? 'text-primary' : 'text-white/40'}>{lastMatch.player_a.nickname}</span>
                                        <span className="text-white/10 text-xs px-2">VS</span>
                                        <span className={lastMatch.winner_id === lastMatch.player_b_id ? 'text-primary' : 'text-white/40'}>{lastMatch.player_b.nickname}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleUndo}
                                    disabled={loading}
                                    className="w-full py-4 border border-red-500/30 text-red-400 font-bold uppercase text-xs tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                                >
                                    Void This Match
                                </button>
                            </div>
                        ) : (
                            <p className="text-white/20 italic text-center py-10">No recent matches to undo.</p>
                        )}
                    </div>

                    <div className="glass p-8 rounded-[2rem] space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Instructions</h3>
                        <ul className="text-xs text-white/60 space-y-2 list-disc pl-4 leading-relaxed">
                            <li>Enter nicknames exactly as they appear in-game.</li>
                            <li>If a player is new, they will be initialized at 1200 rating.</li>
                            <li>The system handles Elo calculations automatically.</li>
                            <li>Undo will revert ratings to the exact state before the match.</li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    );
}
