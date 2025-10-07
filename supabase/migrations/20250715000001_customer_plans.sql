/*
  # Customer Plans and Registration Support
  
  This migration adds support for customer plans and registration:
  - Customer plans table for different subscription tiers
  - Customer subscriptions table for active customer subscriptions
  - Enhanced customers table with plan support
*/

-- Customer Plans Table
CREATE TABLE IF NOT EXISTS customer_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_inr numeric NOT NULL DEFAULT 0,
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual', 'free')),
  shipment_limit integer, -- NULL means unlimited
  features jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default customer plans
INSERT INTO customer_plans (name, description, price_inr, billing_cycle, shipment_limit, features) VALUES
  ('Basic Plan', 'Perfect for occasional shipments', 0, 'free', 5, '["Basic tracking", "Email notifications", "Customer support"]'),
  ('Premium Plan', 'Ideal for regular users', 299, 'monthly', NULL, '["Unlimited shipments", "Real-time tracking", "SMS & Email notifications", "Priority support", "Delivery preferences"]'),
  ('Enterprise Plan', 'For businesses with high volume', 999, 'monthly', NULL, '["Unlimited shipments", "Advanced analytics", "API access", "Dedicated support", "Custom integrations", "Bulk operations"]')
ON CONFLICT DO NOTHING;

-- Customer Subscriptions Table
CREATE TABLE IF NOT EXISTS customer_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES customer_plans(id),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending_payment')),
  amount_paid numeric NOT NULL DEFAULT 0,
  payment_method text,
  transaction_id text,
  auto_renew boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced customers table (if it doesn't exist, create it)
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  address text,
  preferred_delivery_time text,
  payment_method text DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'upi', 'wallet')),
  notification_preferences jsonb DEFAULT '{"sms": true, "email": true, "push": true}',
  total_shipments integer DEFAULT 0,
  rating numeric DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  loyalty_points integer DEFAULT 0,
  current_plan_id uuid REFERENCES customer_plans(id),
  registration_date timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE customer_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Customer plans (public read, admin write)
CREATE POLICY "Anyone can view customer plans" ON customer_plans FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage customer plans" ON customer_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Customer subscriptions (users can view their own, admin can view all)
CREATE POLICY "Users can view own subscriptions" ON customer_subscriptions FOR SELECT TO authenticated USING (auth.uid() = customer_id);
CREATE POLICY "Users can manage own subscriptions" ON customer_subscriptions FOR ALL TO authenticated USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Admin can view all subscriptions" ON customer_subscriptions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Customers (users can view their own, admin can view all)
CREATE POLICY "Users can view own customer data" ON customers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own customer data" ON customers FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can view all customer data" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Function to create customer subscription
CREATE OR REPLACE FUNCTION create_customer_subscription(
  p_customer_id uuid,
  p_plan_id uuid,
  p_payment_method text DEFAULT NULL,
  p_transaction_id text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_subscription_id uuid;
  v_plan_price numeric;
  v_billing_cycle text;
BEGIN
  -- Get plan details
  SELECT price_inr, billing_cycle INTO v_plan_price, v_billing_cycle
  FROM customer_plans WHERE id = p_plan_id;
  
  -- Create subscription
  INSERT INTO customer_subscriptions (
    customer_id,
    plan_id,
    start_date,
    end_date,
    amount_paid,
    payment_method,
    transaction_id
  ) VALUES (
    p_customer_id,
    p_plan_id,
    CURRENT_DATE,
    CASE 
      WHEN v_billing_cycle = 'monthly' THEN CURRENT_DATE + INTERVAL '1 month'
      WHEN v_billing_cycle = 'quarterly' THEN CURRENT_DATE + INTERVAL '3 months'
      WHEN v_billing_cycle = 'annual' THEN CURRENT_DATE + INTERVAL '1 year'
      ELSE CURRENT_DATE + INTERVAL '1 year' -- Default for free plans
    END,
    v_plan_price,
    p_payment_method,
    p_transaction_id
  ) RETURNING id INTO v_subscription_id;
  
  -- Update customer's current plan
  UPDATE customers 
  SET current_plan_id = p_plan_id, updated_at = now()
  WHERE user_id = p_customer_id;
  
  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check customer plan limits
CREATE OR REPLACE FUNCTION check_customer_shipment_limit(
  p_customer_id uuid
)
RETURNS boolean AS $$
DECLARE
  v_plan_limit integer;
  v_current_shipments integer;
  v_plan_billing_cycle text;
BEGIN
  -- Get current plan details
  SELECT cp.shipment_limit, cp.billing_cycle
  INTO v_plan_limit, v_plan_billing_cycle
  FROM customers c
  JOIN customer_plans cp ON c.current_plan_id = cp.id
  WHERE c.user_id = p_customer_id;
  
  -- If no limit (unlimited), return true
  IF v_plan_limit IS NULL THEN
    RETURN true;
  END IF;
  
  -- Count current month shipments for monthly plans
  IF v_plan_billing_cycle = 'monthly' THEN
    SELECT COUNT(*) INTO v_current_shipments
    FROM shipments s
    WHERE s.customer_id = p_customer_id
    AND s.created_at >= date_trunc('month', CURRENT_DATE);
  ELSE
    -- For other billing cycles, count all active shipments
    SELECT COUNT(*) INTO v_current_shipments
    FROM shipments s
    WHERE s.customer_id = p_customer_id
    AND s.status NOT IN ('delivered', 'cancelled', 'failed');
  END IF;
  
  RETURN v_current_shipments < v_plan_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
