import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (!url || !key) {
        // Return a mock object to prevent build-time crashes in @supabase/ssr
        return {
            auth: {
                getUser: () => Promise.resolve({ data: { user: null }, error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } })
            },
            from: () => ({
                select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }), order: () => ({ limit: () => ({ data: [], error: null }) }) }) }),
            })
        } as any;
    }

    return createBrowserClient(url, key);
}
