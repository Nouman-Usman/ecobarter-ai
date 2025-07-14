/*
  # Add Dummy Data for EcoBarter AI

  1. Dummy Users (profiles)
  2. Dummy Items
  3. Sample Trades
  4. Sample Messages

  Note: This assumes some users have been created through auth
*/

-- Insert dummy profiles (these would normally be created via auth signup)
-- We'll create them manually for demo purposes
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'alex.johnson@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Alex Johnson"}',
    false,
    'authenticated'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'sarah.chen@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Sarah Chen"}',
    false,
    'authenticated'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'mike.rodriguez@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Mike Rodriguez"}',
    false,
    'authenticated'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440004',
    'emma.thompson@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Emma Thompson"}',
    false,
    'authenticated'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440005',
    'david.kim@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "David Kim"}',
    false,
    'authenticated'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert profiles
INSERT INTO profiles (id, email, full_name, location) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'alex.johnson@example.com', 'Alex Johnson', 'San Francisco, CA'),
  ('550e8400-e29b-41d4-a716-446655440002', 'sarah.chen@example.com', 'Sarah Chen', 'New York, NY'),
  ('550e8400-e29b-41d4-a716-446655440003', 'mike.rodriguez@example.com', 'Mike Rodriguez', 'Seattle, WA'),
  ('550e8400-e29b-41d4-a716-446655440004', 'emma.thompson@example.com', 'Emma Thompson', 'Denver, CO'),
  ('550e8400-e29b-41d4-a716-446655440005', 'david.kim@example.com', 'David Kim', 'Austin, TX')
ON CONFLICT (id) DO NOTHING;

-- Insert dummy items
INSERT INTO items (id, user_id, title, description, category, condition, value, images, status) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440101',
    '550e8400-e29b-41d4-a716-446655440001',
    'Vintage Acoustic Guitar',
    'Beautiful vintage guitar in excellent condition with rich, warm tones. Perfect for folk, country, and acoustic performances. Comes with original case.',
    'Musical Instruments',
    'excellent',
    450,
    '{"https://images.pexels.com/photos/1049690/pexels-photo-1049690.jpeg?auto=compress&cs=tinysrgb&w=400"}',
    'available'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440102',
    '550e8400-e29b-41d4-a716-446655440002',
    'High-End DSLR Camera',
    'Professional camera with multiple lenses, perfect for photography enthusiasts and professionals. Includes 50mm and 85mm lenses.',
    'Electronics',
    'good',
    800,
    '{"https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400"}',
    'available'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440103',
    '550e8400-e29b-41d4-a716-446655440003',
    'Artisan Coffee Maker',
    'Premium espresso machine for coffee lovers, includes grinder and accessories. Makes barista-quality coffee at home.',
    'Kitchen',
    'excellent',
    320,
    '{"https://images.pexels.com/photos/4226796/pexels-photo-4226796.jpeg?auto=compress&cs=tinysrgb&w=400"}',
    'available'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440104',
    '550e8400-e29b-41d4-a716-446655440004',
    'Mountain Bike',
    'Professional trail bike with premium components, perfect for outdoor adventures. Recently serviced and ready to ride.',
    'Sports',
    'good',
    600,
    '{"https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400"}',
    'available'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440105',
    '550e8400-e29b-41d4-a716-446655440005',
    'Designer Office Chair',
    'Ergonomic chair with premium materials, excellent for home office setup. Adjustable height and lumbar support.',
    'Home & Garden',
    'excellent',
    400,
    '{"https://images.pexels.com/photos/586024/pexels-photo-586024.jpeg?auto=compress&cs=tinysrgb&w=400"}',
    'available'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440106',
    '550e8400-e29b-41d4-a716-446655440001',
    'Professional Art Set',
    'Complete set with paints, brushes, and canvas for professional artists. Includes watercolors, acrylics, and oil paints.',
    'Art & Crafts',
    'good',
    280,
    '{"https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=400"}',
    'available'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440107',
    '550e8400-e29b-41d4-a716-446655440002',
    'Gaming Laptop',
    'High-performance gaming laptop with RTX graphics card. Perfect for gaming and creative work. Barely used.',
    'Electronics',
    'excellent',
    1200,
    '{"https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400"}',
    'available'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440108',
    '550e8400-e29b-41d4-a716-446655440003',
    'Yoga Mat Set',
    'Premium yoga mat with blocks and strap. Non-slip surface and eco-friendly materials. Great for home workouts.',
    'Sports',
    'excellent',
    80,
    '{"https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=400"}',
    'available'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440109',
    '550e8400-e29b-41d4-a716-446655440004',
    'Vintage Vinyl Records',
    'Collection of classic rock and jazz vinyl records from the 70s and 80s. All in excellent condition with original sleeves.',
    'Art & Crafts',
    'excellent',
    350,
    '{"https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg?auto=compress&cs=tinysrgb&w=400"}',
    'available'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440110',
    '550e8400-e29b-41d4-a716-446655440005',
    'Smart Watch',
    'Latest model smartwatch with fitness tracking, GPS, and health monitoring. Includes original charger and bands.',
    'Electronics',
    'good',
    250,
    '{"https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=400"}',
    'available'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample trades
INSERT INTO trades (id, requester_id, owner_id, requester_item_id, owner_item_id, status, message) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440201',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440102',
    '550e8400-e29b-41d4-a716-446655440101',
    'pending',
    'Hi! I''d love to trade my DSLR camera for your vintage guitar. Both are valued similarly and I think it would be a great trade!'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440202',
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440104',
    '550e8400-e29b-41d4-a716-446655440103',
    'accepted',
    'Would you be interested in trading your coffee maker for my mountain bike? I can add some cash to balance the value difference.'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample messages
INSERT INTO messages (trade_id, sender_id, content, message_type) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440201',
    '550e8400-e29b-41d4-a716-446655440002',
    'Hi! I''d love to trade my DSLR camera for your vintage guitar. Both are valued similarly and I think it would be a great trade!',
    'message'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440201',
    '550e8400-e29b-41d4-a716-446655440001',
    'That sounds interesting! Can you tell me more about the condition of the camera? How many shots has it taken?',
    'message'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440201',
    '550e8400-e29b-41d4-a716-446655440002',
    'The camera has about 15,000 shots on it, which is very low for a DSLR. It comes with both lenses and all original accessories.',
    'message'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440202',
    '550e8400-e29b-41d4-a716-446655440004',
    'Would you be interested in trading your coffee maker for my mountain bike? I can add some cash to balance the value difference.',
    'proposal'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440202',
    '550e8400-e29b-41d4-a716-446655440003',
    'That''s a great offer! How much cash were you thinking? The bike is worth quite a bit more than the coffee maker.',
    'message'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440202',
    '550e8400-e29b-41d4-a716-446655440004',
    'I was thinking around $280 to make up the difference. Does that work for you?',
    'counter'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440202',
    '550e8400-e29b-41d4-a716-446655440003',
    'Perfect! That sounds fair. Let''s do it!',
    'message'
  )
ON CONFLICT (trade_id, sender_id, content) DO NOTHING;