import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
    const cookieStore = cookies();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (!url || !key) {
        if (process.env.NODE_ENV === "production") {
            console.warn("⚠️ Supabase credentials missing. Server client de-activated.");
        }
        // Return a minimal compliant object to prevent build-time crashes
        return {
            auth: { getUser: () => Promise.resolve({ data: { user: null }, error: null }) },
            from: () => ({
                select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
            })
        } as any;
    }

    return createServerClient(
        url,
        key,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch {
                        // The `set` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: "", ...options });
                    } catch {
                        // The `delete` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}
