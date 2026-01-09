'use server';

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// --- SERVICE ROLE CLIENT (ADMIN POWER) ---
// This bypasses RLS and allows User Management API calls
const getAdminClient = () => {
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const sbServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!sbServiceKey) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY. Cannot perform admin action.");
    }

    return createClient(sbUrl, sbServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};

// --- AUTH CHECK ---
// Ensure the person CALLING this action is actually a Superuser
const verifySuperuser = async () => {
    const cookieStore = await cookies();

    // Create a regular client to check the current user's session from cookies
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    // We are not setting cookies here, just reading
                }
            }
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Check Role using ADMIN client to bypass RLS policies
    const adminSupabase = getAdminClient();
    const { data: profile } = await adminSupabase.from('profiles').select('role').eq('id', user.id).single();

    if (profile?.role !== 'superuser') {
        throw new Error("Insufficient Permissions: Superuser Required");
    }

    return true;
};

// --- ACTION: CREATE USER ---
export async function createUserAccount(email: string, password: string, role: string) {
    console.log(`[CreateUser] Starting for ${email} with role ${role}`);
    try {
        await verifySuperuser();
        const supabaseAdmin = getAdminClient();

        // Log key prefix for debugging (safe)
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
        console.log(`[CreateUser] Service Key Check: ${key.substring(0, 5)}...`);

        // 1. Create Auth User
        // Pass metadata so triggers can use it if configured
        console.log("[CreateUser] Calling auth.admin.createUser...");
        const { data: user, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { role }
        });

        if (authError) {
            console.error("[CreateUser] Auth Error:", JSON.stringify(authError, null, 2));
            throw authError; // This might be "Database error" or "User already registered"
        }

        if (!user.user) throw new Error("Failed to create user object");
        console.log(`[CreateUser] Auth User Created: ${user.user.id}`);

        // 2. Create Profile (Using Upsert to be safe, though ID should be new)
        console.log("[CreateUser] Upserting Profile...");
        const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
            id: user.user.id,
            email: email,
            role: role // 'admin' or 'user'
        });

        if (profileError) {
            console.error("[CreateUser] Profile Error:", JSON.stringify(profileError, null, 2));
            throw profileError;
        }

        console.log("[CreateUser] Success!");
        return { success: true, message: `User ${email} created successfully!` };

    } catch (error: any) {
        console.error("[CreateUser] Catch Block:", error);
        return { success: false, message: error.message };
    }
}

// --- ACTION: RESET PASSWORD ---
export async function resetUserPassword(userId: string, newPassword: string) {
    try {
        await verifySuperuser();
        const supabaseAdmin = getAdminClient();

        const { error } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { password: newPassword }
        );

        if (error) throw error;

        return { success: true, message: "Password updated successfully!" };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
