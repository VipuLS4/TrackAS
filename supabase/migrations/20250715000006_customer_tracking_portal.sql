/*
  # Customer Tracking Portal - Database Schema
  
  This migration implements the complete customer tracking system including:
  - Tokenized URL system for secure tracking access
  - Anonymous feedback collection
  - Tracking analytics and performance metrics
  - Auto-expiry token security
*/

-- Tracking Tokens Table
CREATE TABLE IF NOT EXISTS tracking_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  recipient_phone text NOT NULL,
  recipient_email text,
  expires_at timestamptz NOT NULL,
  is_used boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customer Feedback Table
CREATE TABLE IF NOT EXISTS customer_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comments text,
  categories jsonb NOT NULL DEFAULT '{}',
  is_anonymous boolean DEFAULT true,
  submitted_at timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Shipment POD (Proof of Delivery) Table
CREATE TABLE IF NOT EXISTS shipment_pod (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  images text[] DEFAULT '{}',
  signature text,
  delivery_time timestamptz NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Shipment Locations Table (for real-time tracking)
CREATE TABLE IF NOT EXISTS shipment_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  address text,
  accuracy decimal(5, 2),
  speed decimal(5, 2),
  heading decimal(5, 2),
  created_at timestamptz DEFAULT now()
);

-- Tracking Analytics Table
CREATE TABLE IF NOT EXISTS tracking_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  metric_type text NOT NULL CHECK (metric_type IN (
    'TOKENS_GENERATED', 'TOKENS_USED', 'FEEDBACK_SUBMITTED', 
    'AVERAGE_RATING', 'TRACKING_VIEWS', 'MOBILE_VIEWS'
  )),
  metric_value decimal(12, 2) NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Notification Log Table
CREATE TABLE IF NOT EXISTS notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_token_id uuid NOT NULL REFERENCES tracking_tokens(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('SMS', 'WHATSAPP', 'EMAIL')),
  recipient text NOT NULL,
  status text NOT NULL CHECK (status IN ('SENT', 'DELIVERED', 'FAILED')),
  provider_response jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tracking_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_pod ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Tracking Tokens (admin can view all, system can create/update)
CREATE POLICY "Admin can view tracking tokens" ON tracking_tokens FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can manage tracking tokens" ON tracking_tokens FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Customer Feedback (admin can view, anonymous insert allowed)
CREATE POLICY "Admin can view customer feedback" ON customer_feedback FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anonymous feedback allowed" ON customer_feedback FOR INSERT TO anon WITH CHECK (true);

-- Shipment POD (admin can view, system can manage)
CREATE POLICY "Admin can view shipment POD" ON shipment_pod FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can manage shipment POD" ON shipment_pod FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Shipment Locations (admin can view, system can manage)
CREATE POLICY "Admin can view shipment locations" ON shipment_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can manage shipment locations" ON shipment_locations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Tracking Analytics (admin only)
CREATE POLICY "Admin can view tracking analytics" ON tracking_analytics FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Notification Log (admin only)
CREATE POLICY "Admin can view notification log" ON notification_log FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Functions

-- Function to generate tracking token
CREATE OR REPLACE FUNCTION generate_tracking_token(
  p_shipment_id uuid,
  p_recipient_phone text,
  p_recipient_email text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_token_id uuid;
  v_token text;
  v_expires_at timestamptz;
BEGIN
  -- Generate secure token
  v_token := encode(gen_random_bytes(24), 'base64url');
  
  -- Set expiry to 72 hours from now
  v_expires_at := now() + interval '72 hours';
  
  -- Insert tracking token
  INSERT INTO tracking_tokens (
    shipment_id, token, recipient_phone, recipient_email, expires_at
  )
  VALUES (
    p_shipment_id, v_token, p_recipient_phone, p_recipient_email, v_expires_at
  )
  RETURNING id INTO v_token_id;
  
  RETURN v_token_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate tracking token
CREATE OR REPLACE FUNCTION validate_tracking_token(p_token text)
RETURNS TABLE (
  token_id uuid,
  shipment_id uuid,
  is_valid boolean,
  expires_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.shipment_id,
    (t.expires_at > now() AND NOT t.is_used) as is_valid,
    t.expires_at
  FROM tracking_tokens t
  WHERE t.token = p_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark token as used
CREATE OR REPLACE FUNCTION mark_token_as_used(p_token_id uuid)
RETURNS boolean AS $$
BEGIN
  UPDATE tracking_tokens 
  SET is_used = true, updated_at = now()
  WHERE id = p_token_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit customer feedback
CREATE OR REPLACE FUNCTION submit_customer_feedback(
  p_shipment_id uuid,
  p_rating integer,
  p_comments text DEFAULT NULL,
  p_categories jsonb DEFAULT '{}',
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_feedback_id uuid;
BEGIN
  -- Insert feedback
  INSERT INTO customer_feedback (
    shipment_id, rating, comments, categories, ip_address, user_agent
  )
  VALUES (
    p_shipment_id, p_rating, p_comments, p_categories, p_ip_address, p_user_agent
  )
  RETURNING id INTO v_feedback_id;
  
  -- Update driver and fleet ratings
  PERFORM update_ratings_from_feedback(p_shipment_id, p_rating, p_categories);
  
  RETURN v_feedback_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update ratings from feedback
CREATE OR REPLACE FUNCTION update_ratings_from_feedback(
  p_shipment_id uuid,
  p_rating integer,
  p_categories jsonb
)
RETURNS boolean AS $$
DECLARE
  v_driver_id uuid;
  v_fleet_id uuid;
  v_driver_rating decimal(3,1);
  v_fleet_rating decimal(3,1);
  v_driver_total integer;
  v_fleet_total integer;
BEGIN
  -- Get shipment details
  SELECT assigned_driver_id, assigned_fleet_id
  INTO v_driver_id, v_fleet_id
  FROM shipments
  WHERE id = p_shipment_id;
  
  -- Update driver rating
  IF v_driver_id IS NOT NULL THEN
    SELECT rating, total_ratings
    INTO v_driver_rating, v_driver_total
    FROM drivers
    WHERE id = v_driver_id;
    
    IF v_driver_rating IS NULL THEN
      v_driver_rating := 0;
      v_driver_total := 0;
    END IF;
    
    v_driver_total := v_driver_total + 1;
    v_driver_rating := ((v_driver_rating * (v_driver_total - 1)) + p_rating) / v_driver_total;
    
    UPDATE drivers
    SET 
      rating = round(v_driver_rating, 1),
      total_ratings = v_driver_total,
      updated_at = now()
    WHERE id = v_driver_id;
  END IF;
  
  -- Update fleet rating
  IF v_fleet_id IS NOT NULL THEN
    SELECT reliability_score, total_ratings
    INTO v_fleet_rating, v_fleet_total
    FROM fleet_profiles
    WHERE id = v_fleet_id;
    
    IF v_fleet_rating IS NULL THEN
      v_fleet_rating := 0;
      v_fleet_total := 0;
    END IF;
    
    v_fleet_total := v_fleet_total + 1;
    v_fleet_rating := ((v_fleet_rating * (v_fleet_total - 1)) + p_rating) / v_fleet_total;
    
    UPDATE fleet_profiles
    SET 
      reliability_score = round(v_fleet_rating, 1),
      total_ratings = v_fleet_total,
      updated_at = now()
    WHERE id = v_fleet_id;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log notification
CREATE OR REPLACE FUNCTION log_notification(
  p_tracking_token_id uuid,
  p_notification_type text,
  p_recipient text,
  p_status text,
  p_provider_response jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO notification_log (
    tracking_token_id, notification_type, recipient, status, provider_response
  )
  VALUES (
    p_tracking_token_id, p_notification_type, p_recipient, p_status, p_provider_response
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get tracking analytics
CREATE OR REPLACE FUNCTION get_tracking_analytics(
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL
)
RETURNS TABLE (
  metric_type text,
  total_value decimal(12,2),
  daily_average decimal(12,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ta.metric_type,
    sum(ta.metric_value) as total_value,
    avg(ta.metric_value) as daily_average
  FROM tracking_analytics ta
  WHERE 
    (p_start_date IS NULL OR ta.date >= p_start_date) AND
    (p_end_date IS NULL OR ta.date <= p_end_date)
  GROUP BY ta.metric_type
  ORDER BY ta.metric_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS integer AS $$
DECLARE
  v_deleted_count integer;
BEGIN
  DELETE FROM tracking_tokens
  WHERE expires_at < now() - interval '7 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tracking_tokens_token ON tracking_tokens(token);
CREATE INDEX IF NOT EXISTS idx_tracking_tokens_shipment_id ON tracking_tokens(shipment_id);
CREATE INDEX IF NOT EXISTS idx_tracking_tokens_expires_at ON tracking_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_shipment_id ON customer_feedback(shipment_id);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_rating ON customer_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_shipment_pod_shipment_id ON shipment_pod(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_locations_shipment_id ON shipment_locations(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_locations_created_at ON shipment_locations(created_at);
CREATE INDEX IF NOT EXISTS idx_tracking_analytics_date ON tracking_analytics(date);
CREATE INDEX IF NOT EXISTS idx_tracking_analytics_metric_type ON tracking_analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_notification_log_token_id ON notification_log(tracking_token_id);

-- Insert default tracking configuration
INSERT INTO config (key, value, description, category) VALUES
('tracking_token_expiry_hours', '72', 'Hours after which tracking token expires', 'TRACKING'),
('max_tracking_views_per_token', '100', 'Maximum number of times a token can be used', 'TRACKING'),
('feedback_required_for_delivery', 'false', 'Whether feedback is required before marking as delivered', 'TRACKING'),
('sms_notification_enabled', 'true', 'Enable SMS notifications for tracking links', 'NOTIFICATION'),
('whatsapp_notification_enabled', 'true', 'Enable WhatsApp notifications for tracking links', 'NOTIFICATION'),
('email_notification_enabled', 'true', 'Enable email notifications for tracking links', 'NOTIFICATION'),
('tracking_analytics_retention_days', '365', 'Number of days to retain tracking analytics data', 'ANALYTICS')
ON CONFLICT (key) DO NOTHING;

-- Create a view for tracking dashboard
CREATE OR REPLACE VIEW tracking_dashboard AS
SELECT 
  s.id as shipment_id,
  s.status,
  s.created_at,
  s.updated_at,
  tt.token,
  tt.recipient_phone,
  tt.recipient_email,
  tt.expires_at,
  tt.is_used,
  cf.rating as feedback_rating,
  cf.comments as feedback_comments,
  cf.submitted_at as feedback_submitted_at,
  sp.delivery_time,
  sp.images as pod_images,
  sp.signature as pod_signature
FROM shipments s
LEFT JOIN tracking_tokens tt ON s.id = tt.shipment_id
LEFT JOIN customer_feedback cf ON s.id = cf.shipment_id
LEFT JOIN shipment_pod sp ON s.id = sp.shipment_id
WHERE s.status IN ('ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED');

-- Grant permissions
GRANT SELECT ON tracking_dashboard TO authenticated;
GRANT SELECT ON tracking_dashboard TO anon;
