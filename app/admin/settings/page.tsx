'use client';

import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { Settings, Plus, Trash2, CheckCircle2, AlertCircle, Loader2, Save } from 'lucide-react';

export default function RankSettingsPage() {
    const [ranks, setRanks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const supabase = createSupabaseClient();

    useEffect(() => {
        fetchRanks();
    }, []);

    async function fetchRanks() {
        setLoading(true);
        const { data } = await supabase.from('ranks').select('*').order('min_rating', { ascending: false });
        setRanks(data || []);
        setLoading(false);
    }

    async function addRank() {
        const newRank = { name: 'New Tier', min_rating: 0, color_hex: '#ffffff' };
        const { data, error } = await supabase.from('ranks').insert(newRank).select();
        if (error) setMessage({ type: 'error', text: error.message });
        else {
            setRanks([...ranks, data[0]].sort((a, b) => b.min_rating - a.min_rating));
            setMessage({ type: 'success', text: 'Rank tier added.' });
        }
    }

    async function updateRank(id: string, updates: any) {
        const { error } = await supabase.from('ranks').update(updates).eq('id', id);
        if (error) setMessage({ type: 'error', text: error.message });
    }

    async function deleteRank(id: string) {
        if (!confirm('Permanent deletion. Proceed?')) return;
        const { error } = await supabase.from('ranks').delete().eq('id', id);
        if (error) setMessage({ type: 'error', text: error.message });
        else {
            setRanks(ranks.filter(r => r.id !== id));
            setMessage({ type: 'success', text: 'Rank tier removed.' });
        }
    }

    if (loading) return <div className="py-24 text-center text-white/20 uppercase font-black italic animate-pulse">Consulting the scrolls...</div>;

    return (
        <div className="max-w-4xl space-y-8 animate-fade-in">
            <header className="flex justify-between items-end gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black uppercase italic tracking-tight flex items-center gap-3">
                        <Settings className="text-primary" />
                        Rank Architect
                    </h1>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Define the thresholds of glory and the tiers of jousting mastery.</p>
                </div>
                <button
                    onClick={addRank}
                    className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-primary hover:text-black transition-all group"
                >
                    <Plus className="group-hover:rotate-90 transition-transform" />
                </button>
            </header>

            <div className="space-y-4">
                {ranks.map((rank) => (
                    <div key={rank.id} className="glass p-6 rounded-3xl flex flex-wrap md:flex-nowrap items-center gap-6 border border-white/5">
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-2">Tier Name</label>
                                <input
                                    type="text"
                                    defaultValue={rank.name}
                                    onBlur={(e) => updateRank(rank.id, { name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:border-primary/50 outline-none font-bold uppercase italic"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-2">Min Rating</label>
                                <input
                                    type="number"
                                    defaultValue={rank.min_rating}
                                    onBlur={(e) => updateRank(rank.id, { min_rating: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:border-primary/50 outline-none font-black italic"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-2">Color</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        defaultValue={rank.color_hex}
                                        onBlur={(e) => updateRank(rank.id, { color_hex: e.target.value })}
                                        className="w-12 h-10 bg-white/5 border border-white/10 rounded-xl cursor-pointer p-1"
                                    />
                                    <input
                                        type="text"
                                        defaultValue={rank.color_hex}
                                        onBlur={(e) => updateRank(rank.id, { color_hex: e.target.value })}
                                        className="flex-grow bg-white/5 border border-white/10 rounded-xl py-2 px-4 focus:border-primary/50 outline-none font-mono text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => deleteRank(rank.id)}
                                className="p-3 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}

                {!ranks.length && (
                    <div className="glass py-24 rounded-3xl text-center space-y-4">
                        <Settings className="w-12 h-12 text-white/10 mx-auto" />
                        <p className="text-white/20 font-bold uppercase tracking-widest italic">No rank tiers defined yet.</p>
                        <button onClick={addRank} className="text-primary hover:underline text-xs font-bold uppercase tracking-widest">Establish the first tier</button>
                    </div>
                )}
            </div>

            {message && (
                <div className={`p-4 rounded-2xl border flex items-center gap-3 font-bold uppercase text-[10px] tracking-widest ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </div>
            )}
        </div>
    );
}
