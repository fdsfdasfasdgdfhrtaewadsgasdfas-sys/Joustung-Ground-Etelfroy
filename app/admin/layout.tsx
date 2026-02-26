import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { LogOut, Swords, Settings, History, ShieldAlert } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) redirect('/login');

    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

    const isAdmin = roleData?.role === 'admin';

    return (
        <div className="flex flex-col md:flex-row gap-8 py-8 animate-fade-in">
            {/* Sidebar Nav */}
            <aside className="w-full md:w-64 space-y-4">
                <div className="glass p-6 rounded-3xl space-y-6">
                    <div className="space-y-1">
                        <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Logged in as</p>
                        <p className="font-bold truncate text-sm">{session.user.email}</p>
                        <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${isAdmin ? 'bg-primary/20 text-primary' : 'bg-blue-500/20 text-blue-400'}`}>
                            {roleData?.role || 'Guest'}
                        </span>
                    </div>

                    <nav className="flex flex-col gap-2">
                        <Link href="/admin" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors font-bold uppercase text-xs">
                            <Swords size={16} /> Submit Match
                        </Link>
                        {isAdmin && (
                            <>
                                <Link href="/admin/ratings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors font-bold uppercase text-xs">
                                    <ShieldAlert size={16} /> Edit Ratings
                                </Link>
                                <Link href="/admin/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors font-bold uppercase text-xs">
                                    <Settings size={16} /> Arena Ranks
                                </Link>
                            </>
                        )}
                        <div className="pt-4 border-t border-white/5">
                            <form action="/auth/signout" method="post">
                                <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors font-bold uppercase text-xs w-full text-left">
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </form>
                        </div>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-grow">
                {children}
            </div>
        </div>
    );
}
