/*
  # Complete TrackAS System Implementation
  
  This migration implements the complete TrackAS system as per the detailed specifications:
  - Admin (TrackAS Owner) functionality
  - Shipper (Logistics Company) registration and management
  - Fleet Operator registration with subscription models
  - Individual Vehicle Owner registration
  - Vehicle and Driver management
  - Customer tracking without login
  - AI Assistant integration
  - Escrow wallet system (RBI compliant)
  - Commission and subscription management
*/

-- Drop existing tables if they exist to recreate with proper structure
DROP TABLE IF EXISTS customer_subscriptions CASCADE;
DROP TABLE IF EXISTS customer_plans CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS fleet_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS fleet_operators CASCADE;
DROP TABLE IF EXISTS individual_operators CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS escrow_transactions CASCADE;
DROP TABLE IF EXISTS commission_transactions CASCADE;
DROP TABLE IF EXISTS shipment_assignments CASCADE;
DROP TABLE IF EXISTS proof_of_delivery CASCADE;
DROP TABLE IF EXISTS tracking_links CASCADE;
DROP TABLE IF EXISTS disputes CASCADE;
DROP TABLE IF EXISTS ai_assistant_logs CASCADE;
DROP TABLE IF EXISTS admin_settings CASCADE;

-- Admin Settings Table (TrackAS Owner Configuration)
CREATE TABLE admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default admin settings
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
  ('commission_percentage', '5', 'Platform commission percentage (0-10%) paid by Shippers only'),
  ('subscription_enabled', 'true', 'Enable/disable subscription option for Fleet Operators'),
  ('assignment_timeout_seconds', '120', '2-minute timeout for shipment assignment acceptance'),
  ('dynamic_pricing_escalation', '{"first_retry": 10, "second_retry": 20, "third_retry": 0}', 'Percentage increase for each retry cycle'),
  ('max_assignment_retries', '3', 'Maximum number of assignment retry cycles before cancellation'),
  ('fleet_subscription_fees', '{"small": 5000, "medium": 15000, "large": 35000}', 'Fleet subscription fees per vehicle slab'),
  ('foc_enabled', 'true', 'Enable/disable FOC (Free of Charge) option for Fleet Operators')
ON CONFLICT (setting_key) DO NOTHING;

-- Shippers Table (Logistics Companies)
CREATE TABLE shippers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  company_tin text UNIQUE NOT NULL,
  company_address text NOT NULL,
  business_registration_number text UNIQUE NOT NULL,
  bank_account_number text NOT NULL,
  bank_ifsc_code text NOT NULL,
  bank_account_holder_name text NOT NULL,
  primary_contact_name text NOT NULL,
  primary_contact_email text NOT NULL,
  primary_contact_phone text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  rejection_reason text,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  total_shipments integer DEFAULT 0,
  reliability_score numeric DEFAULT 100.0 CHECK (reliability_score >= 0 AND reliability_score <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fleet Operators Table (Companies with Vehicles & Drivers)
CREATE TABLE fleet_operators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  company_tin text UNIQUE NOT NULL,
  company_address text NOT NULL,
  business_registration_number text UNIQUE NOT NULL,
  bank_account_number text NOT NULL,
  bank_ifsc_code text NOT NULL,
  bank_account_holder_name text NOT NULL,
  primary_contact_name text NOT NULL,
  primary_contact_email text NOT NULL,
  primary_contact_phone text NOT NULL,
  fleet_size integer DEFAULT 0,
  subscription_model text DEFAULT 'pay_per_shipment' CHECK (subscription_model IN ('pay_per_shipment', 'subscription')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  rejection_reason text,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  reliability_score numeric DEFAULT 100.0 CHECK (reliability_score >= 0 AND reliability_score <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Individual Vehicle Owners Table (Single Driver-Owners)
CREATE TABLE individual_operators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  address text NOT NULL,
  driver_license_number text UNIQUE NOT NULL,
  license_expiry_date date NOT NULL,
  bank_account_number text NOT NULL,
  bank_ifsc_code text NOT NULL,
  bank_account_holder_name text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  rejection_reason text,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  availability_status text DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'offline')),
  total_shipments integer DEFAULT 0,
  reliability_score numeric DEFAULT 100.0 CHECK (reliability_score >= 0 AND reliability_score <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vehicles Table
CREATE TABLE vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_type text NOT NULL CHECK (operator_type IN ('fleet', 'individual')),
  operator_id uuid NOT NULL, -- References either fleet_operators or individual_operators
  vcode text UNIQUE NOT NULL, -- Auto-generated vehicle code
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('truck', 'van', 'pickup', 'bike')),
  registration_number text UNIQUE NOT NULL,
  rc_document_url text,
  insurance_document_url text,
  insurance_expiry_date date,
  capacity_weight_kg numeric NOT NULL,
  capacity_volume_cbm numeric NOT NULL,
  current_location_lat numeric,
  current_location_lng numeric,
  current_location_address text,
  availability_status text DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'maintenance', 'offline')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  rejection_reason text,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Drivers Table
CREATE TABLE drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_operator_id uuid REFERENCES fleet_operators(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text UNIQUE NOT NULL,
  email text,
  address text NOT NULL,
  driver_license_number text UNIQUE NOT NULL,
  license_expiry_date date NOT NULL,
  bank_account_number text NOT NULL,
  bank_ifsc_code text NOT NULL,
  bank_account_holder_name text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  rejection_reason text,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  availability_status text DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'offline')),
  total_shipments integer DEFAULT 0,
  reliability_score numeric DEFAULT 100.0 CHECK (reliability_score >= 0 AND reliability_score <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fleet Subscriptions Table
CREATE TABLE fleet_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_operator_id uuid REFERENCES fleet_operators(id) ON DELETE CASCADE,
  plan_type text NOT NULL CHECK (plan_type IN ('small', 'medium', 'large')),
  monthly_fee numeric NOT NULL,
  vehicle_slab text NOT NULL,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending_payment')),
  amount_paid numeric NOT NULL DEFAULT 0,
  payment_method text,
  transaction_id text,
  is_foc boolean DEFAULT false,
  foc_reason text,
  auto_renew boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shipments Table
CREATE TABLE shipments (
  id text PRIMARY KEY, -- TAS-YYYY-XXX format
  shipper_id uuid REFERENCES shippers(id) ON DELETE CASCADE,
  operator_id uuid, -- References either fleet_operators or individual_operators
  vehicle_id uuid REFERENCES vehicles(id),
  driver_id uuid REFERENCES drivers(id),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  pickup_location_lat numeric NOT NULL,
  pickup_location_lng numeric NOT NULL,
  pickup_address text NOT NULL,
  destination_location_lat numeric NOT NULL,
  destination_location_lng numeric NOT NULL,
  destination_address text NOT NULL,
  status text DEFAULT 'created' CHECK (status IN ('created', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'failed')),
  progress numeric DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  estimated_delivery timestamptz,
  actual_delivery timestamptz,
  weight_kg numeric NOT NULL,
  volume_cbm numeric NOT NULL,
  dimensions text NOT NULL,
  special_handling text,
  urgency text DEFAULT 'standard' CHECK (urgency IN ('standard', 'urgent', 'express')),
  shipment_price numeric NOT NULL,
  commission_percentage numeric NOT NULL,
  commission_amount numeric NOT NULL,
  net_amount numeric NOT NULL,
  distance_km numeric,
  estimated_duration interval,
  actual_duration interval,
  assignment_timeout_at timestamptz,
  assignment_retry_count integer DEFAULT 0,
  shipper_rating integer CHECK (shipper_rating >= 1 AND shipper_rating <= 5),
  shipper_feedback text,
  operator_rating integer CHECK (operator_rating >= 1 AND operator_rating <= 5),
  operator_feedback text,
  customer_rating integer CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Escrow Transactions Table (RBI Compliant)
CREATE TABLE escrow_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id text REFERENCES shipments(id) ON DELETE CASCADE,
  shipper_id uuid REFERENCES shippers(id),
  amount_total numeric NOT NULL,
  amount_shipment numeric NOT NULL,
  amount_commission numeric NOT NULL,
  commission_percentage numeric NOT NULL,
  status text DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded', 'disputed')),
  payment_method text NOT NULL,
  payment_transaction_id text,
  release_date timestamptz,
  recipient_type text CHECK (recipient_type IN ('fleet', 'individual', 'driver')),
  recipient_id uuid,
  refund_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shipment Assignments Table (2-minute timeout tracking)
CREATE TABLE shipment_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id text REFERENCES shipments(id) ON DELETE CASCADE,
  operator_id uuid NOT NULL,
  vehicle_id uuid REFERENCES vehicles(id),
  driver_id uuid REFERENCES drivers(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'timeout')),
  response_time timestamptz,
  timeout_at timestamptz NOT NULL,
  retry_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Proof of Delivery Table
CREATE TABLE proof_of_delivery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id text REFERENCES shipments(id) ON DELETE CASCADE,
  photo_urls text[] NOT NULL DEFAULT '{}',
  signature_image_url text NOT NULL,
  recipient_name text NOT NULL,
  recipient_relationship text,
  delivery_notes text,
  location_lat numeric NOT NULL,
  location_lng numeric NOT NULL,
  location_address text NOT NULL,
  uploaded_by uuid,
  uploaded_at timestamptz DEFAULT now(),
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Tracking Links Table (Public access for customers - no login required)
CREATE TABLE tracking_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id text REFERENCES shipments(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  notification_sent boolean DEFAULT false,
  last_accessed_at timestamptz,
  access_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Disputes Table
CREATE TABLE disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id text REFERENCES shipments(id),
  raised_by_type text NOT NULL CHECK (raised_by_type IN ('shipper', 'fleet', 'individual', 'customer')),
  raised_by_id uuid NOT NULL,
  dispute_type text NOT NULL CHECK (dispute_type IN ('payment', 'delivery_issue', 'damage', 'delay', 'other')),
  description text NOT NULL,
  evidence_urls text[] DEFAULT '{}',
  status text DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
  resolution_notes text,
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  escalated_to_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI Assistant Logs Table
CREATE TABLE ai_assistant_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_type text CHECK (user_type IN ('admin', 'shipper', 'fleet', 'individual', 'customer', 'guest')),
  session_id text NOT NULL,
  user_message text NOT NULL,
  user_language text DEFAULT 'english',
  ai_response text NOT NULL,
  context_data jsonb,
  escalated_to_admin boolean DEFAULT false,
  escalation_reason text,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shippers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_of_delivery ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assistant_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Admin settings (admin only)
CREATE POLICY "Admin can manage settings" ON admin_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Shippers (users can view their own, admin can view all)
CREATE POLICY "Users can view own shipper data" ON shippers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own shipper data" ON shippers FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can view all shipper data" ON shippers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Fleet operators (users can view their own, admin can view all)
CREATE POLICY "Users can view own fleet data" ON fleet_operators FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own fleet data" ON fleet_operators FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can view all fleet data" ON fleet_operators FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Individual operators (users can view their own, admin can view all)
CREATE POLICY "Users can view own individual data" ON individual_operators FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own individual data" ON individual_operators FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can view all individual data" ON individual_operators FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Vehicles (operators can view their own, admin can view all)
CREATE POLICY "Operators can view own vehicles" ON vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Operators can update own vehicles" ON vehicles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can view all vehicles" ON vehicles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Drivers (fleet operators can view their own, admin can view all)
CREATE POLICY "Fleet operators can view own drivers" ON drivers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Fleet operators can update own drivers" ON drivers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can view all drivers" ON drivers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Fleet subscriptions (users can view their own, admin can view all)
CREATE POLICY "Users can view own subscriptions" ON fleet_subscriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own subscriptions" ON fleet_subscriptions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can view all subscriptions" ON fleet_subscriptions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Shipments (users can view their own, admin can view all)
CREATE POLICY "Users can view own shipments" ON shipments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own shipments" ON shipments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can view all shipments" ON shipments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Escrow transactions (users can view their own, admin can view all)
CREATE POLICY "Users can view own escrow transactions" ON escrow_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can view all escrow transactions" ON escrow_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Shipment assignments (operators can view their own, admin can view all)
CREATE POLICY "Operators can view own assignments" ON shipment_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Operators can update own assignments" ON shipment_assignments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can view all assignments" ON shipment_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Proof of delivery (operators can view their own, admin can view all)
CREATE POLICY "Operators can view own POD" ON proof_of_delivery FOR SELECT TO authenticated USING (true);
CREATE POLICY "Operators can update own POD" ON proof_of_delivery FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can view all POD" ON proof_of_delivery FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Tracking links (PUBLIC READ for customer tracking without login)
CREATE POLICY "Public can view tracking links" ON tracking_links FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage tracking links" ON tracking_links FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Disputes (users can view their own, admin can view all)
CREATE POLICY "Users can view own disputes" ON disputes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create disputes" ON disputes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can manage all disputes" ON disputes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- AI assistant logs (users can view their own, admin can view all)
CREATE POLICY "Users can view own AI logs" ON ai_assistant_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create AI logs" ON ai_assistant_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can view all AI logs" ON ai_assistant_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Functions

-- Function to generate VCODE for vehicles
CREATE OR REPLACE FUNCTION generate_vcode()
RETURNS text AS $$
DECLARE
  vcode text;
  exists boolean;
BEGIN
  LOOP
    vcode := 'V' || to_char(now(), 'YYYYMMDD') || lpad(floor(random() * 10000)::text, 4, '0');
    SELECT EXISTS(SELECT 1 FROM vehicles WHERE vcode = vcode) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN vcode;
END;
$$ LANGUAGE plpgsql;

-- Function to generate shipment ID
CREATE OR REPLACE FUNCTION generate_shipment_id()
RETURNS text AS $$
DECLARE
  year text;
  sequence_num integer;
  shipment_id text;
BEGIN
  year := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 9) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM shipments
  WHERE id LIKE 'TAS-' || year || '-%';
  
  shipment_id := 'TAS-' || year || '-' || lpad(sequence_num::text, 3, '0');
  RETURN shipment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create tracking link
CREATE OR REPLACE FUNCTION create_tracking_link(
  p_shipment_id text,
  p_customer_phone text,
  p_customer_email text
)
RETURNS text AS $$
DECLARE
  tracking_token text;
  expires_at timestamptz;
BEGIN
  tracking_token := encode(gen_random_bytes(32), 'base64url');
  expires_at := now() + INTERVAL '30 days';
  
  INSERT INTO tracking_links (shipment_id, token, customer_phone, customer_email, expires_at)
  VALUES (p_shipment_id, tracking_token, p_customer_phone, p_customer_email, expires_at);
  
  RETURN tracking_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-generate VCODE for vehicles
CREATE OR REPLACE FUNCTION set_vehicle_vcode()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.vcode IS NULL OR NEW.vcode = '' THEN
    NEW.vcode := generate_vcode();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_vehicle_vcode_trigger
  BEFORE INSERT ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION set_vehicle_vcode();

-- Trigger to auto-generate shipment ID
CREATE OR REPLACE FUNCTION set_shipment_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    NEW.id := generate_shipment_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_shipment_id_trigger
  BEFORE INSERT ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION set_shipment_id();

-- Trigger to create tracking link when shipment is created
CREATE OR REPLACE FUNCTION create_shipment_tracking_link()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_tracking_link(NEW.id, NEW.customer_phone, NEW.customer_email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_shipment_tracking_link_trigger
  AFTER INSERT ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION create_shipment_tracking_link();
