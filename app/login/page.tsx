'use client';

import { useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createSupabaseClient();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/admin');
            router.refresh();
        }
    };

    return (
        <div className="max-w-md mx-auto py-24 animate-fade-in">
            <div className="glass p-10 rounded-[2.5rem] border border-white/10 space-y-8">
                <div className="text-center space-y-2">
                    <div className="bg-primary/20 p-4 rounded-full w-fit mx-auto">
                        <Shield className="text-primary w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black uppercase italic tracking-tight">Judge Portal</h1>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Official access only</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-4">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-6 focus:outline-none focus:border-primary/50 transition-all font-medium"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-4">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-6 focus:outline-none focus:border-primary/50 transition-all font-medium"
                                required
                            />
                            <Lock className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-black font-black uppercase italic py-4 rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enter Arena Control'}
                    </button>
                </form>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase text-center">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
