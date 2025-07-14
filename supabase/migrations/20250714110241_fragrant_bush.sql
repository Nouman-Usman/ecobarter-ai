@@ .. @@
 -- Create profiles table
 CREATE TABLE IF NOT EXISTS profiles (
-  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
+  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
   email text UNIQUE NOT NULL,
   full_name text,
   avatar_url text,
@@ .. @@
 -- Create items table
 CREATE TABLE IF NOT EXISTS items (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
-  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
+  user_id uuid NOT NULL,
   title text NOT NULL,
   description text NOT NULL,
@@ .. @@
   updated_at timestamptz DEFAULT now()
 );
 
+-- Add foreign key constraint for items table
+ALTER TABLE items ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
+
 -- Create trades table