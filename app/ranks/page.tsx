import { supabase } from "@/lib/supabase";
import { Shield, Trophy, Star, Crown, Swords } from "lucide-react";

async function getRanks() {
    const { data } = await supabase.from('ranks').select('*').order('min_rating', { ascending: false });
    return data || [];
}

export default async function RanksPage() {
    const ranks = await getRanks();

    // Default fallback ranks if none are in the DB yet
    const defaultRanks = [
        { name: 'Grandmaster', min_rating: 2200, color: '#d4af37', icon: <Crown /> },
        { name: 'Diamond', min_rating: 2000, color: '#b9f2ff', icon: <Star /> },
        { name: 'Platinum', min_rating: 1800, color: '#e5e4e2', icon: <Shield /> },
        { name: 'Gold', min_rating: 1600, color: '#ffd700', icon: <Trophy /> },
        { name: 'Silver', min_rating: 1400, color: '#c0c0c0', icon: <Swords /> },
        { name: 'Bronze', min_rating: 1200, color: '#cd7f32', icon: <Swords /> },
    ];

    const displayRanks = ranks.length > 0 ? ranks : defaultRanks;

    return (
        <div className="max-w-4xl mx-auto space-y-12 py-12 animate-fade-in">
            <header className="text-center space-y-4">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">Rank <span className="text-primary">Tiers</span></h1>
                <p className="text-white/40 max-w-xl mx-auto uppercase text-xs font-bold tracking-[0.2em]">The path to glory is defined by your rating. Climb the tiers and earn your place among legends.</p>
            </header>

            <div className="space-y-6">
                {displayRanks.map((rank: any, index) => (
                    <div key={index} className="glass p-8 rounded-3xl flex items-center justify-between group hover:border-white/20 transition-all">
                        <div className="flex items-center gap-8">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform" style={{ color: rank.color_hex || rank.color }}>
                                {rank.icon || <Shield size={32} />}
                            </div>
                            <div>
                                <h2 className="text-3xl font-black uppercase italic tracking-tight" style={{ color: rank.color_hex || rank.color }}>
                                    {rank.name}
                                </h2>
                                <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">Minimum Rating Required</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-4xl font-black italic">{rank.min_rating}</p>
                            <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest">ELO</p>
                        </div>
                    </div>
                ))}
            </div>

            <section className="glass p-10 rounded-[3rem] space-y-6 border border-white/10 bg-gradient-to-br from-primary/5 to-transparent">
                <h3 className="text-2xl font-bold uppercase italic tracking-tight">How it works</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed text-white/60">
                    <div className="space-y-4">
                        <p><strong className="text-white uppercase tracking-widest text-[10px]">The Math</strong><br /> We use the standard Elo rating algorithm. Your rating changes based on the relative skill level of your opponent.</p>
                        <p><strong className="text-white uppercase tracking-widest text-[10px]">Provisional Period</strong><br /> For your first 10 matches, your rating is in a "Provisional" state. Changes are amplified to help you reach your true rank faster.</p>
                    </div>
                    <div className="space-y-4">
                        <p><strong className="text-white uppercase tracking-widest text-[10px]">Unbeatable Odds</strong><br /> Defeating a higher-rated player grants significantly more points than defeating a lower-rated one.</p>
                        <p><strong className="text-white uppercase tracking-widest text-[10px]">Integrity</strong><br /> Rankings are updated in real-time. Matches are verified by our dedicated judge panel.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
