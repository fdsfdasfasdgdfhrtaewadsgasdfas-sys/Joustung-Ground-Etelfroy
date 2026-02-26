'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function submitMatchAction(formData: FormData) {
    const supabase = createServerActionClient({ cookies });

    const playerA = formData.get('playerA') as string;
    const playerB = formData.get('playerB') as string;
    const winner = formData.get('winner') as string;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('submit_match', {
        host_id: session.user.id,
        p_a_nickname: playerA,
        p_b_nickname: playerB,
        winner_nickname: winner
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/leaderboard');
    revalidatePath('/matches');
    revalidatePath(`/players/${playerA}`);
    revalidatePath(`/players/${playerB}`);

    return { success: true, matchId: data };
}

export async function undoMatchAction(matchId: string) {
    const supabase = createServerActionClient({ cookies });

    const { error } = await supabase.rpc('undo_match', {
        match_to_undo_id: matchId
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/leaderboard');
    revalidatePath('/matches');

    return { success: true };
}

export async function editPlayerRatingAction(playerId: string, newRating: number, reason: string) {
    const supabase = createServerActionClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { error } = await supabase.rpc('admin_edit_rating', {
        admin_id: session.user.id,
        p_id: playerId,
        new_r: newRating,
        v_reason: reason
    });

    if (error) return { error: error.message };

    revalidatePath('/leaderboard');
    return { success: true };
}
