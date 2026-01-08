'use server';

import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 1. ADMIN CLIENT (Bypasses RLS)
// We use this to read data reliably.
function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!key) {
        console.warn("Missing SUPABASE_SERVICE_ROLE_KEY. Admin operations will fail.");
        return null;
    }

    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

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
    const cookieStore = await cookies();
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
    if (!user) return null;

    // Use Auth Client to Fetch Role (Respects RLS - "Users can read own profile")
    // This avoids crashing if SUPABASE_SERVICE_ROLE_KEY is missing in Cloudflare
    const { data, error } = await authClient
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
    const role = await getUserRole();

    if (role !== 'superuser' && role !== 'admin') {
        return { error: "Unauthorized" };
    }

    const adminSupabase = getAdminClient();
    if (!adminSupabase) {
        return { error: "Server Error: Missing Admin Configuration" };
    }



    // 2. Fetch All Profiles
    const { data, error } = await adminSupabase
        .from('profiles')
        .select('*')
        .order('email', { ascending: true });

    if (error) return { error: error.message };
    return { data };
}
