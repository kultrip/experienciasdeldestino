-- Experiencias del Destino - Database Schema (FIXED)
-- Based on CONTEXT.md specifications

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('central', 'delegado', 'productor')),
  province TEXT,
  full_name TEXT,
  phone TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Experiences Table
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  province TEXT NOT NULL,
  city TEXT,
  category TEXT,
  
  -- Pricing fields (normalized as per CONTEXT.md)
  price TEXT,
  price_numeric DECIMAL(10, 2),
  price_per_person DECIMAL(10, 2),
  min_group_size INTEGER DEFAULT 1,
  max_group_size INTEGER,
  
  -- Ownership relationships
  created_by UUID REFERENCES user_profiles(id),
  producer_id UUID REFERENCES user_profiles(id),
  delegado_id UUID REFERENCES user_profiles(id),
  central_id UUID REFERENCES user_profiles(id),
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'archived')),
  
  -- Media
  main_image TEXT,
  images JSONB DEFAULT '[]',
  
  -- Additional info
  duration TEXT,
  language TEXT DEFAULT 'es',
  included JSONB DEFAULT '[]',
  requirements TEXT,
  cancellation_policy TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experience_id UUID REFERENCES experiences(id) ON DELETE SET NULL,
  
  -- Customer info
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  
  -- Booking details
  participants INTEGER NOT NULL DEFAULT 1,
  booking_date DATE,
  selected_time TIME,
  
  -- Pricing
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  
  -- Payment provider info
  payment_provider TEXT,
  payment_id TEXT,
  
  -- Additional info
  special_requests TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  
  -- Payment details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'eur',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  
  -- Provider info
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'paypal', 'cash', 'transfer')),
  provider_payment_id TEXT,
  provider_metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Commission Rules Table (for future use)
CREATE TABLE IF NOT EXISTS commission_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Scope: can be global, per-user, or per-experience
  scope TEXT NOT NULL CHECK (scope IN ('global', 'user', 'experience')),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  province TEXT,
  
  -- Commission splits (must total 100%)
  central_percentage DECIMAL(5, 2) NOT NULL DEFAULT 20.00,
  delegado_percentage DECIMAL(5, 2) NOT NULL DEFAULT 30.00,
  productor_percentage DECIMAL(5, 2) NOT NULL DEFAULT 50.00,
  
  -- Validation
  CONSTRAINT valid_total CHECK (central_percentage + delegado_percentage + productor_percentage = 100),
  
  -- Metadata
  notes TEXT,
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_until DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message Timeline Table (for future communication tracking)
CREATE TABLE IF NOT EXISTS message_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Related to user (productor or delegado)
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Message type
  type TEXT NOT NULL CHECK (type IN ('email', 'whatsapp', 'internal', 'approval', 'commission_change')),
  
  -- Message content
  subject TEXT,
  content TEXT,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  
  -- Status
  status TEXT DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'delivered', 'read', 'failed')),
  
  -- References
  related_booking_id UUID REFERENCES bookings(id),
  related_experience_id UUID REFERENCES experiences(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_experiences_province ON experiences(province);
CREATE INDEX IF NOT EXISTS idx_experiences_status ON experiences(status);
CREATE INDEX IF NOT EXISTS idx_experiences_producer_id ON experiences(producer_id);
CREATE INDEX IF NOT EXISTS idx_experiences_delegado_id ON experiences(delegado_id);
CREATE INDEX IF NOT EXISTS idx_bookings_experience_id ON bookings(experience_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_message_timeline_user_id ON message_timeline(user_id);

-- Functions
-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON experiences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commission_rules_updated_at BEFORE UPDATE ON commission_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_timeline ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies (FIXED)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Central can view all profiles" ON user_profiles;
CREATE POLICY "Central can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    (SELECT role FROM user_profiles WHERE user_id = auth.uid()) = 'central'
  );

-- Experiences Policies (FIXED)
DROP POLICY IF EXISTS "Anyone can view published experiences" ON experiences;
CREATE POLICY "Anyone can view published experiences"
  ON experiences FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Users can view own experiences" ON experiences;
CREATE POLICY "Users can view own experiences"
  ON experiences FOR SELECT
  USING (
    created_by = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Productores can create experiences" ON experiences;
CREATE POLICY "Productores can create experiences"
  ON experiences FOR INSERT
  WITH CHECK (
    (SELECT role FROM user_profiles WHERE user_id = auth.uid()) IN ('productor', 'delegado', 'central')
  );

DROP POLICY IF EXISTS "Users can update own experiences" ON experiences;
CREATE POLICY "Users can update own experiences"
  ON experiences FOR UPDATE
  USING (
    created_by = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
  );

-- Bookings Policies (SIMPLIFIED - Service role will handle most operations)
DROP POLICY IF EXISTS "Service role can manage bookings" ON bookings;
CREATE POLICY "Service role can manage bookings"
  ON bookings FOR ALL
  USING (true)
  WITH CHECK (true);

-- Payments Policies (SIMPLIFIED)
DROP POLICY IF EXISTS "Service role can manage payments" ON payments;
CREATE POLICY "Service role can manage payments"
  ON payments FOR ALL
  USING (true)
  WITH CHECK (true);

-- Commission Rules Policies
DROP POLICY IF EXISTS "Central can manage commission rules" ON commission_rules;
CREATE POLICY "Central can manage commission rules"
  ON commission_rules FOR ALL
  USING (
    (SELECT role FROM user_profiles WHERE user_id = auth.uid()) = 'central'
  )
  WITH CHECK (
    (SELECT role FROM user_profiles WHERE user_id = auth.uid()) = 'central'
  );

-- Message Timeline Policies
DROP POLICY IF EXISTS "Users can view own messages" ON message_timeline;
CREATE POLICY "Users can view own messages"
  ON message_timeline FOR SELECT
  USING (
    user_id = (SELECT id FROM user_profiles WHERE user_id = auth.uid())
    OR
    (SELECT role FROM user_profiles WHERE user_id = auth.uid()) = 'central'
  );
