'use server';

import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 1. ADMIN CLIENT (Bypasses RLS)
// We use this to read data reliably.
const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

// 2. HELPER: Get Current Auth User
async function getAuthUser() {
    const cookieStore = await cookies(); // Await cookies() for Next.js 15+


    // We need a separate client just to verify the session cookie
    const authClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value },
            }
        }
    );
    const { data: { user } } = await authClient.auth.getUser();
    return user;
}

// --- PUBLIC ACTIONS ---

export async function getUserRole() {
    const user = await getAuthUser();
    if (!user) return null;

    // Use Admin Client to Fetch Role (No Recursion Risk)
    const { data, error } = await adminSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error("Server Action Role Error:", error);
        return 'user'; // Fallback
    }
    return data?.role || 'user';
}

export async function getAllProfiles() {
    const user = await getAuthUser();
    if (!user) return { error: "Not Authenticated" };

    // 1. Check if requester is Admin/Superuser
    const { data: requesterProfile } = await adminSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!requesterProfile || (requesterProfile.role !== 'superuser' && requesterProfile.role !== 'admin')) {
        return { error: "Unauthorized" };
    }

    // 2. Fetch All Profiles
    const { data, error } = await adminSupabase
        .from('profiles')
        .select('*')
        .order('email', { ascending: true });

    if (error) return { error: error.message };
    return { data };
}
