import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client component client (for use in client components)
export const createSupabaseClient = () => createClientComponentClient();

// Server component client (for use in server components)
export const createSupabaseServerClient = () => createServerComponentClient({ cookies });

// Database types
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  value: number;
  images: string[];
  status: 'available' | 'trading' | 'traded';
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Trade {
  id: string;
  requester_id: string;
  owner_id: string;
  requester_item_id?: string;
  owner_item_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  message?: string;
  created_at: string;
  updated_at: string;
  requester?: Profile;
  owner?: Profile;
  requester_item?: Item;
  owner_item?: Item;
}

export interface Message {
  id: string;
  trade_id: string;
  sender_id: string;
  content: string;
  message_type: 'message' | 'proposal' | 'counter';
  created_at: string;
  sender?: Profile;
}

// Auth helpers
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Database helpers
export const getItems = async (limit = 20, offset = 0) => {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      profiles (
        id,
        full_name,
        location
      )
    `)
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return { data, error };
};

export const getItemById = async (id: string) => {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      profiles (
        id,
        full_name,
        location,
        email
      )
    `)
    .eq('id', id)
    .single();

  return { data, error };
};

export const getUserItems = async (userId: string) => {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
};

export const createItem = async (item: Omit<Item, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('items')
    .insert(item)
    .select()
    .single();

  return { data, error };
};

export const updateItem = async (id: string, updates: Partial<Item>) => {
  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

export const deleteItem = async (id: string) => {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id);

  return { error };
};

export const createTrade = async (trade: Omit<Trade, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('trades')
    .insert(trade)
    .select()
    .single();

  return { data, error };
};

export const getUserTrades = async (userId: string) => {
  const { data, error } = await supabase
    .from('trades')
    .select(`
      *,
      requester:profiles!trades_requester_id_fkey (
        id,
        full_name,
        email
      ),
      owner:profiles!trades_owner_id_fkey (
        id,
        full_name,
        email
      ),
      requester_item:items!trades_requester_item_id_fkey (
        id,
        title,
        value,
        images
      ),
      owner_item:items!trades_owner_item_id_fkey (
        id,
        title,
        value,
        images
      )
    `)
    .or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  return { data, error };
};

export const updateTrade = async (id: string, updates: Partial<Trade>) => {
  const { data, error } = await supabase
    .from('trades')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

export const getTradeMessages = async (tradeId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles (
        id,
        full_name
      )
    `)
    .eq('trade_id', tradeId)
    .order('created_at', { ascending: true });

  return { data, error };
};

export const createMessage = async (message: Omit<Message, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select(`
      *,
      sender:profiles (
        id,
        full_name
      )
    `)
    .single();

  return { data, error };
};

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
};