/*
  # Shipment Lifecycle Database Schema
  
  This migration implements the complete shipment lifecycle system including:
  - Shipment creation and management
  - Assignment and matching with 2-minute cycles
  - Pickup, transit, and delivery workflows
  - Payment settlement and escrow
  - Feedback and ratings system
  - Admin management tools
*/

-- Core Shipments Table
CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vcode_shipper text NOT NULL REFERENCES user_profiles(vcode),
  shipper_id uuid NOT NULL REFERENCES auth.users(id),
  
  -- Location Information
  pickup_location jsonb NOT NULL, -- {lat, lng, address, pin_code}
  drop_location jsonb NOT NULL, -- {lat, lng, address, pin_code}
  
  -- Consignment Details
  consignment_details jsonb NOT NULL, -- {items, weight, dimensions, volume, description}
  customer_info jsonb NOT NULL, -- {receiver_name, phone, email, special_instructions}
  
  -- Pricing Information
  price_submitted decimal(10,2) NOT NULL,
  price_validated boolean DEFAULT false,
  recommended_price decimal(10,2),
  confidence_score decimal(3,2), -- 0.00 to 1.00
  price_flag text CHECK (price_flag IN ('OK', 'LOW', 'TOO_HIGH')),
  
  -- Status and Assignment
  status text NOT NULL DEFAULT 'CREATED' CHECK (status IN (
    'CREATED', 'PUBLISHED', 'PENDING_ASSIGN', 'ASSIGNED', 
    'PICKUP_ARRIVED', 'PICKED_UP', 'IN_TRANSIT', 
    'DELIVERED', 'CANCELLED', 'FAILED', 'ESCALATED_TO_ADMIN'
  )),
  
  -- Assignment Details
  assigned_fleet_id uuid REFERENCES fleet_profiles(id),
  assigned_vehicle_id uuid REFERENCES fleet_vehicles(id),
  assigned_driver_id uuid REFERENCES fleet_drivers(id),
  acceptance_deadline timestamptz,
  retry_count integer DEFAULT 0,
  
  -- Escrow and Payment
  escrow_txn_id text,
  commission_amount decimal(10,2),
  commission_percentage decimal(5,2),
  
  -- Preferences and Settings
  preferred_pickup_window jsonb, -- {start_time, end_time}
  preferred_delivery_window jsonb, -- {start_time, end_time}
  urgency text DEFAULT 'normal' CHECK (urgency IN ('normal', 'express')),
  vehicle_type_preference text,
  insurance_required boolean DEFAULT false,
  
  -- Escalation and History
  escalation_history jsonb DEFAULT '[]'::jsonb,
  current_cycle integer DEFAULT 1,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,
  assigned_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz
);

-- Enhanced Fleets Table
CREATE TABLE IF NOT EXISTS fleets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id uuid REFERENCES user_profiles(id),
  name text NOT NULL,
  subscription_tier text DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'premium', 'enterprise')),
  reliability_score decimal(3,2) DEFAULT 0.00, -- 0.00 to 1.00
  kyc_status text DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  contact jsonb NOT NULL, -- {email, phone, address}
  payment_details jsonb NOT NULL, -- {account_number, ifsc_code, account_holder}
  fleet_location jsonb, -- {lat, lng, address} - centroid
  max_pickup_radius integer DEFAULT 50, -- km
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_id uuid REFERENCES fleet_profiles(id),
  owner_id uuid REFERENCES individual_profiles(id), -- For individual vehicles
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('truck', 'van', 'tempo', 'container', 'trailer')),
  capacity jsonb NOT NULL, -- {weight_kg, volume_cbm, dimensions}
  current_location jsonb, -- {lat, lng, address, updated_at}
  vcode text UNIQUE,
  status text DEFAULT 'available' CHECK (status IN ('available', 'busy', 'maintenance', 'offline')),
  insurance_valid_until date,
  pollution_valid_until date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id),
  name text NOT NULL,
  license_no text NOT NULL,
  license_expiry date,
  contact jsonb NOT NULL, -- {phone, email}
  rating decimal(3,2) DEFAULT 0.00, -- 0.00 to 5.00
  acceptance_rate decimal(3,2) DEFAULT 0.00, -- 0.00 to 1.00
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shipment Events (Audit Trail)
CREATE TABLE IF NOT EXISTS shipment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- CREATED, PUBLISHED, ASSIGNED, PICKUP_ARRIVED, etc.
  actor_id uuid REFERENCES auth.users(id),
  actor_type text, -- 'shipper', 'fleet', 'driver', 'system', 'admin'
  metadata jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now()
);

-- Shipment Bids/Requests (Request Cycles)
CREATE TABLE IF NOT EXISTS shipment_bids_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  cycle_no integer NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('subscribed_fleets', 'all_eligible')),
  candidates_list jsonb DEFAULT '[]'::jsonb,
  selected_candidate uuid,
  status text DEFAULT 'active' CHECK (status IN ('active', 'accepted', 'rejected', 'timeout')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  payer_id uuid REFERENCES auth.users(id),
  payee_id uuid REFERENCES auth.users(id),
  amount decimal(10,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('ESCROW_IN', 'COMMISSION', 'SETTLEMENT', 'REFUND', 'CHARGEBACK')),
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'HELD', 'COMPLETE', 'FAILED', 'CANCELLED')),
  provider_txn_id text,
  provider_response jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ratings Table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  rater_id uuid NOT NULL REFERENCES auth.users(id),
  rated_entity_id uuid NOT NULL, -- Can be driver_id, fleet_id, or shipper_id
  rated_entity_type text NOT NULL CHECK (rated_entity_type IN ('driver', 'fleet', 'shipper')),
  stars integer NOT NULL CHECK (stars >= 1 AND stars <= 5),
  comments text,
  structured_feedback jsonb, -- {timeliness, damage, communication, etc.}
  created_at timestamptz DEFAULT now()
);

-- Configuration Table
CREATE TABLE IF NOT EXISTS config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Documents Table (for POD, signatures, etc.)
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid REFERENCES shipments(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('POD', 'SIGNATURE', 'INVOICE', 'PRE_LOAD_PHOTO', 'DAMAGE_PHOTO')),
  file_url text NOT NULL,
  file_metadata jsonb DEFAULT '{}'::jsonb, -- {size, type, uploaded_by, etc.}
  uploaded_by uuid REFERENCES auth.users(id),
  uploaded_at timestamptz DEFAULT now()
);

-- Disputes Table
CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  raised_by uuid NOT NULL REFERENCES auth.users(id),
  dispute_type text NOT NULL CHECK (dispute_type IN ('DAMAGE', 'DELAY', 'MISSING_ITEMS', 'WRONG_DELIVERY', 'PAYMENT', 'OTHER')),
  description text NOT NULL,
  evidence jsonb DEFAULT '[]'::jsonb, -- Array of document IDs
  status text DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED')),
  resolution jsonb,
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  shipment_id uuid REFERENCES shipments(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('PUSH', 'SMS', 'EMAIL', 'WHATSAPP')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'DELIVERED', 'FAILED')),
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_bids_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Shipments (users can view their own shipments, admin can view all)
CREATE POLICY "Users can view own shipments" ON shipments FOR SELECT TO authenticated USING (
  shipper_id = auth.uid() OR 
  assigned_fleet_id IN (SELECT id FROM fleet_profiles WHERE user_profile_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  )) OR
  assigned_driver_id IN (SELECT id FROM fleet_drivers WHERE vehicle_id IN (
    SELECT id FROM vehicles WHERE owner_id IN (
      SELECT id FROM individual_profiles WHERE user_profile_id IN (
        SELECT id FROM user_profiles WHERE user_id = auth.uid()
      )
    )
  ))
);

CREATE POLICY "Users can update own shipments" ON shipments FOR UPDATE TO authenticated USING (
  shipper_id = auth.uid() OR 
  assigned_fleet_id IN (SELECT id FROM fleet_profiles WHERE user_profile_id IN (
    SELECT id FROM user_profiles WHERE user_id = auth.uid()
  ))
);

CREATE POLICY "Admin can manage all shipments" ON shipments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Fleets
CREATE POLICY "Users can view own fleet" ON fleets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own fleet" ON fleets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can view all fleets" ON fleets FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Vehicles
CREATE POLICY "Users can view own vehicles" ON vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own vehicles" ON vehicles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can view all vehicles" ON vehicles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Drivers
CREATE POLICY "Users can view own drivers" ON drivers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own drivers" ON drivers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can view all drivers" ON drivers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Shipment Events (read-only for users, admin can manage)
CREATE POLICY "Users can view shipment events" ON shipment_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage shipment events" ON shipment_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Shipment Bids Requests (fleet/driver can view their requests)
CREATE POLICY "Users can view relevant bids" ON shipment_bids_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage bids" ON shipment_bids_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Payments (users can view their payments)
CREATE POLICY "Users can view own payments" ON payments FOR SELECT TO authenticated USING (
  payer_id = auth.uid() OR payee_id = auth.uid()
);
CREATE POLICY "Admin can manage all payments" ON payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Ratings (users can view ratings for their shipments)
CREATE POLICY "Users can view relevant ratings" ON ratings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create ratings" ON ratings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can manage ratings" ON ratings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Config (admin only)
CREATE POLICY "Admin can manage config" ON config FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Documents (users can view documents for their shipments)
CREATE POLICY "Users can view relevant documents" ON documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can upload documents" ON documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can manage documents" ON documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Disputes (users can view disputes for their shipments)
CREATE POLICY "Users can view relevant disputes" ON disputes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create disputes" ON disputes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can manage disputes" ON disputes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Notifications (users can view their notifications)
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin can manage notifications" ON notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Functions

-- Function to create shipment event
CREATE OR REPLACE FUNCTION create_shipment_event(
  p_shipment_id uuid,
  p_event_type text,
  p_actor_id uuid DEFAULT NULL,
  p_actor_type text DEFAULT 'system',
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid AS $$
DECLARE
  v_event_id uuid;
BEGIN
  INSERT INTO shipment_events (shipment_id, event_type, actor_id, actor_type, metadata)
  VALUES (p_shipment_id, p_event_type, p_actor_id, p_actor_type, p_metadata)
  RETURNING id INTO v_event_id;
  
  -- Update shipment updated_at timestamp
  UPDATE shipments SET updated_at = now() WHERE id = p_shipment_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update shipment status
CREATE OR REPLACE FUNCTION update_shipment_status(
  p_shipment_id uuid,
  p_status text,
  p_actor_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS boolean AS $$
DECLARE
  v_old_status text;
BEGIN
  -- Get current status
  SELECT status INTO v_old_status FROM shipments WHERE id = p_shipment_id;
  
  -- Update status
  UPDATE shipments 
  SET 
    status = p_status,
    updated_at = now(),
    -- Set specific timestamps based on status
    published_at = CASE WHEN p_status = 'PUBLISHED' THEN now() ELSE published_at END,
    assigned_at = CASE WHEN p_status = 'ASSIGNED' THEN now() ELSE assigned_at END,
    picked_up_at = CASE WHEN p_status = 'PICKED_UP' THEN now() ELSE picked_up_at END,
    delivered_at = CASE WHEN p_status = 'DELIVERED' THEN now() ELSE delivered_at END
  WHERE id = p_shipment_id;
  
  -- Create event
  PERFORM create_shipment_event(
    p_shipment_id,
    'STATUS_CHANGED',
    p_actor_id,
    'system',
    jsonb_build_object(
      'old_status', v_old_status,
      'new_status', p_status,
      'metadata', p_metadata
    )
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate fleet reliability score
CREATE OR REPLACE FUNCTION calculate_fleet_reliability_score(p_fleet_id uuid)
RETURNS decimal(3,2) AS $$
DECLARE
  v_score decimal(3,2) := 0.00;
  v_total_shipments integer;
  v_completed_shipments integer;
  v_on_time_deliveries integer;
  v_avg_rating decimal(3,2);
BEGIN
  -- Get total shipments for this fleet
  SELECT COUNT(*) INTO v_total_shipments
  FROM shipments 
  WHERE assigned_fleet_id = p_fleet_id;
  
  -- Get completed shipments
  SELECT COUNT(*) INTO v_completed_shipments
  FROM shipments 
  WHERE assigned_fleet_id = p_fleet_id 
  AND status IN ('DELIVERED', 'CANCELLED', 'FAILED');
  
  -- Get on-time deliveries (delivered within preferred window)
  SELECT COUNT(*) INTO v_on_time_deliveries
  FROM shipments 
  WHERE assigned_fleet_id = p_fleet_id 
  AND status = 'DELIVERED'
  AND delivered_at <= (preferred_delivery_window->>'end_time')::timestamptz;
  
  -- Get average rating
  SELECT COALESCE(AVG(stars), 0) INTO v_avg_rating
  FROM ratings r
  JOIN shipments s ON r.shipment_id = s.id
  WHERE s.assigned_fleet_id = p_fleet_id
  AND r.rated_entity_type = 'fleet';
  
  -- Calculate composite score (weighted)
  IF v_total_shipments > 0 THEN
    v_score := (
      (v_completed_shipments::decimal / v_total_shipments::decimal) * 0.4 +
      (v_on_time_deliveries::decimal / GREATEST(v_completed_shipments, 1)::decimal) * 0.3 +
      (v_avg_rating / 5.0) * 0.3
    );
  END IF;
  
  RETURN LEAST(v_score, 1.00);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to find eligible candidates for shipment
CREATE OR REPLACE FUNCTION find_shipment_candidates(
  p_shipment_id uuid,
  p_candidate_type text DEFAULT 'all_eligible'
)
RETURNS TABLE(
  candidate_id uuid,
  candidate_type text,
  score decimal(5,2),
  vehicle_type text,
  proximity_km decimal(8,2),
  reliability_score decimal(3,2),
  acceptance_rate decimal(3,2)
) AS $$
DECLARE
  v_shipment shipments%ROWTYPE;
BEGIN
  -- Get shipment details
  SELECT * INTO v_shipment FROM shipments WHERE id = p_shipment_id;
  
  -- Return fleet candidates
  IF p_candidate_type IN ('subscribed_fleets', 'all_eligible') THEN
    RETURN QUERY
    SELECT 
      f.id as candidate_id,
      'fleet'::text as candidate_type,
      (
        CASE WHEN v.vehicle_type = v_shipment.vehicle_type_preference THEN 100 ELSE 50 END +
        CASE WHEN f.subscription_tier = 'enterprise' THEN 30
             WHEN f.subscription_tier = 'premium' THEN 20
             WHEN f.subscription_tier = 'basic' THEN 10
             ELSE 0 END +
        f.reliability_score * 50 +
        COALESCE(d.acceptance_rate, 0) * 20
      ) as score,
      v.vehicle_type,
      ST_Distance(
        ST_Point((v.current_location->>'lng')::decimal, (v.current_location->>'lat')::decimal),
        ST_Point((v_shipment.pickup_location->>'lng')::decimal, (v_shipment.pickup_location->>'lat')::decimal)
      ) / 1000 as proximity_km,
      f.reliability_score,
      COALESCE(d.acceptance_rate, 0)
    FROM fleets f
    JOIN vehicles v ON v.fleet_id = f.id
    LEFT JOIN drivers d ON d.vehicle_id = v.id
    WHERE f.is_active = true
    AND v.status = 'available'
    AND (p_candidate_type = 'all_eligible' OR f.subscription_tier IN ('premium', 'enterprise'))
    AND ST_DWithin(
      ST_Point((v.current_location->>'lng')::decimal, (v.current_location->>'lat')::decimal),
      ST_Point((v_shipment.pickup_location->>'lng')::decimal, (v_shipment.pickup_location->>'lat')::decimal),
      f.max_pickup_radius * 1000
    )
    ORDER BY score DESC;
  END IF;
  
  -- Return individual vehicle candidates
  IF p_candidate_type = 'all_eligible' THEN
    RETURN QUERY
    SELECT 
      v.id as candidate_id,
      'individual'::text as candidate_type,
      (
        CASE WHEN v.vehicle_type = v_shipment.vehicle_type_preference THEN 100 ELSE 50 END +
        COALESCE(d.acceptance_rate, 0) * 30
      ) as score,
      v.vehicle_type,
      ST_Distance(
        ST_Point((v.current_location->>'lng')::decimal, (v.current_location->>'lat')::decimal),
        ST_Point((v_shipment.pickup_location->>'lng')::decimal, (v_shipment.pickup_location->>'lat')::decimal)
      ) / 1000 as proximity_km,
      0.5::decimal(3,2) as reliability_score, -- Default for individuals
      COALESCE(d.acceptance_rate, 0)
    FROM vehicles v
    LEFT JOIN drivers d ON d.vehicle_id = v.id
    WHERE v.fleet_id IS NULL -- Individual vehicles
    AND v.status = 'available'
    AND ST_DWithin(
      ST_Point((v.current_location->>'lng')::decimal, (v.current_location->>'lat')::decimal),
      ST_Point((v_shipment.pickup_location->>'lng')::decimal, (v_shipment.pickup_location->>'lat')::decimal),
      50 * 1000 -- 50km default radius for individuals
    )
    ORDER BY score DESC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default configuration
INSERT INTO config (key, value, description) VALUES
('assignment_cycle_duration', '120', 'Assignment cycle duration in seconds (2 minutes)'),
('max_pickup_radius', '50', 'Maximum pickup radius in km for individual vehicles'),
('price_escalation_steps', '[10, 20, 30]', 'Price escalation percentages for retries'),
('commission_percentage', '5.0', 'Default platform commission percentage'),
('settlement_hold_days', '3', 'Number of days to hold settlement for disputes'),
('reliability_threshold', '0.6', 'Minimum reliability score for fleet eligibility'),
('geofence_radius', '100', 'Geofence radius in meters for pickup/delivery'),
('location_ping_interval', '15', 'Location ping interval in seconds during transit')
ON CONFLICT (key) DO NOTHING;
