import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Server component client (for use in server components only)
export const createSupabaseServerClient = () => createServerComponentClient({ cookies });