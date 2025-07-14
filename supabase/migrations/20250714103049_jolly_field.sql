/*
  # Initial Schema for EcoBarter AI

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `avatar_url` (text, optional)
      - `location` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `condition` (text)
      - `value` (numeric)
      - `images` (text array)
      - `status` (text, default 'available')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `trades`
      - `id` (uuid, primary key)
      - `requester_id` (uuid, references profiles)
      - `owner_id` (uuid, references profiles)
      - `requester_item_id` (uuid, references items)
      - `owner_item_id` (uuid, references items)
      - `status` (text, default 'pending')
      - `message` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `messages`
      - `id` (uuid, primary key)
      - `trade_id` (uuid, references trades)
      - `sender_id` (uuid, references profiles)
      - `content` (text)
      - `message_type` (text, default 'message')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access to items and profiles
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  condition text NOT NULL,
  value numeric NOT NULL DEFAULT 0,
  images text[] DEFAULT '{}',
  status text DEFAULT 'available' CHECK (status IN ('available', 'trading', 'traded')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  requester_item_id uuid REFERENCES items(id) ON DELETE CASCADE,
  owner_item_id uuid REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id uuid REFERENCES trades(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  message_type text DEFAULT 'message' CHECK (message_type IN ('message', 'proposal', 'counter')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Items policies
CREATE POLICY "Items are viewable by everyone"
  ON items FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
  ON items FOR DELETE
  USING (auth.uid() = user_id);

-- Trades policies
CREATE POLICY "Users can view trades they're involved in"
  ON trades FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = owner_id);

CREATE POLICY "Users can create trades"
  ON trades FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update trades they're involved in"
  ON trades FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = owner_id);

-- Messages policies
CREATE POLICY "Users can view messages for their trades"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trades 
      WHERE trades.id = messages.trade_id 
      AND (trades.requester_id = auth.uid() OR trades.owner_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages to their trades"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM trades 
      WHERE trades.id = messages.trade_id 
      AND (trades.requester_id = auth.uid() OR trades.owner_id = auth.uid())
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS items_user_id_idx ON items(user_id);
CREATE INDEX IF NOT EXISTS items_category_idx ON items(category);
CREATE INDEX IF NOT EXISTS items_status_idx ON items(status);
CREATE INDEX IF NOT EXISTS trades_requester_id_idx ON trades(requester_id);
CREATE INDEX IF NOT EXISTS trades_owner_id_idx ON trades(owner_id);
CREATE INDEX IF NOT EXISTS messages_trade_id_idx ON messages(trade_id);

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();