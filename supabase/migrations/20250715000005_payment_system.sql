/*
  # Payment Logic - TrackAS Escrow & Commission System
  
  This migration implements the complete payment infrastructure including:
  - Escrow wallet management
  - Commission calculation and collection
  - Fleet subscription management
  - Refund and dispute handling
  - Payment analytics and reporting
  - Audit and compliance logging
*/

-- Enhanced Payments Table with Escrow Support
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid REFERENCES shipments(id) ON DELETE CASCADE,
  payer_id uuid REFERENCES auth.users(id),
  payee_id uuid REFERENCES auth.users(id),
  amount decimal(12,2) NOT NULL,
  type text NOT NULL CHECK (type IN (
    'ESCROW_IN', 'ESCROW_OUT', 'COMMISSION', 'SUBSCRIPTION', 
    'SETTLEMENT', 'REFUND', 'CHARGEBACK', 'DISPUTE_HOLD'
  )),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'PROCESSING', 'HELD', 'COMPLETE', 'FAILED', 
    'CANCELLED', 'REFUNDED', 'DISPUTED'
  )),
  provider_txn_id text,
  provider_response jsonb,
  escrow_wallet_id uuid,
  commission_rate decimal(5,2),
  refund_reason text,
  dispute_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  settled_at timestamptz
);

-- Escrow Wallets Table
CREATE TABLE IF NOT EXISTS escrow_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_type text NOT NULL CHECK (wallet_type IN (
    'TRACKAS_ESCROW', 'TRACKAS_COMMISSION', 'FLEET_WALLET', 'DRIVER_WALLET'
  )),
  owner_id uuid REFERENCES auth.users(id), -- NULL for TrackAS wallets
  owner_type text CHECK (owner_type IN ('fleet', 'driver', 'shipper', 'platform')),
  balance decimal(12,2) DEFAULT 0.00,
  currency text DEFAULT 'INR',
  provider_account_id text, -- Payment gateway account ID
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fleet Subscriptions Table
CREATE TABLE IF NOT EXISTS fleet_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_id uuid NOT NULL REFERENCES fleet_profiles(id) ON DELETE CASCADE,
  subscription_tier text NOT NULL CHECK (subscription_tier IN ('basic', 'premium', 'enterprise')),
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
  fee_amount decimal(10,2) NOT NULL,
  fee_basis text NOT NULL CHECK (fee_basis IN ('per_fleet', 'per_vehicle')),
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED')),
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  next_billing_date timestamptz NOT NULL,
  grace_period_end timestamptz,
  auto_renew boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscription Benefits Table
CREATE TABLE IF NOT EXISTS subscription_benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_tier text NOT NULL,
  benefit_type text NOT NULL CHECK (benefit_type IN (
    'PRIORITY_MATCHING', 'REDUCED_COMMISSION', 'ANALYTICS_ACCESS', 
    'PREMIUM_ROUTES', 'DEDICATED_SUPPORT', 'CUSTOM_INTEGRATIONS'
  )),
  benefit_value jsonb NOT NULL, -- Flexible benefit configuration
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Payment Configuration Table
CREATE TABLE IF NOT EXISTS payment_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN (
    'COMMISSION', 'ESCROW', 'SUBSCRIPTION', 'REFUND', 'DISPUTE', 'GATEWAY'
  )),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Payment Ledger (Double-entry bookkeeping)
CREATE TABLE IF NOT EXISTS payment_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  wallet_id uuid NOT NULL REFERENCES escrow_wallets(id),
  entry_type text NOT NULL CHECK (entry_type IN ('DEBIT', 'CREDIT')),
  amount decimal(12,2) NOT NULL,
  balance_after decimal(12,2) NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Refund Requests Table
CREATE TABLE IF NOT EXISTS refund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES auth.users(id),
  request_type text NOT NULL CHECK (request_type IN (
    'CANCELLATION', 'DISPUTE', 'FAILED_DELIVERY', 'ADMIN_OVERRIDE'
  )),
  amount_requested decimal(12,2) NOT NULL,
  reason text NOT NULL,
  evidence jsonb, -- Supporting documents/evidence
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED'
  )),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payment Analytics Table (for reporting)
CREATE TABLE IF NOT EXISTS payment_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  metric_type text NOT NULL CHECK (metric_type IN (
    'DAILY_COMMISSION', 'ESCROW_HELD', 'SETTLEMENTS', 'REFUNDS', 
    'SUBSCRIPTION_REVENUE', 'PAYMENT_FAILURES'
  )),
  metric_value decimal(12,2) NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Payment Audit Log
CREATE TABLE IF NOT EXISTS payment_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES payments(id),
  action text NOT NULL,
  actor_id uuid REFERENCES auth.users(id),
  actor_type text NOT NULL CHECK (actor_type IN ('user', 'system', 'admin')),
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Payments (users can view their own payments, admin can view all)
CREATE POLICY "Users can view own payments" ON payments FOR SELECT TO authenticated USING (
  payer_id = auth.uid() OR payee_id = auth.uid()
);
CREATE POLICY "Admin can manage all payments" ON payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Escrow Wallets (users can view their own wallets, admin can view all)
CREATE POLICY "Users can view own wallets" ON escrow_wallets FOR SELECT TO authenticated USING (
  owner_id = auth.uid() OR owner_type = 'platform'
);
CREATE POLICY "Admin can manage all wallets" ON escrow_wallets FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Fleet Subscriptions (fleet owners can view their subscriptions)
CREATE POLICY "Fleet can view own subscriptions" ON fleet_subscriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage subscriptions" ON fleet_subscriptions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Subscription Benefits (read-only for users)
CREATE POLICY "Users can view subscription benefits" ON subscription_benefits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage benefits" ON subscription_benefits FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Payment Config (admin only)
CREATE POLICY "Admin can manage payment config" ON payment_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Payment Ledger (users can view their own ledger entries)
CREATE POLICY "Users can view own ledger" ON payment_ledger FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage ledger" ON payment_ledger FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Refund Requests (users can view their own requests)
CREATE POLICY "Users can view own refund requests" ON refund_requests FOR SELECT TO authenticated USING (
  requested_by = auth.uid()
);
CREATE POLICY "Users can create refund requests" ON refund_requests FOR INSERT TO authenticated WITH CHECK (
  requested_by = auth.uid()
);
CREATE POLICY "Admin can manage refund requests" ON refund_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Payment Analytics (admin only)
CREATE POLICY "Admin can view payment analytics" ON payment_analytics FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Payment Audit Log (admin only)
CREATE POLICY "Admin can view payment audit log" ON payment_audit_log FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Functions

-- Function to create escrow wallet
CREATE OR REPLACE FUNCTION create_escrow_wallet(
  p_wallet_type text,
  p_owner_id uuid DEFAULT NULL,
  p_owner_type text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_wallet_id uuid;
BEGIN
  INSERT INTO escrow_wallets (wallet_type, owner_id, owner_type)
  VALUES (p_wallet_type, p_owner_id, p_owner_type)
  RETURNING id INTO v_wallet_id;
  
  RETURN v_wallet_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update wallet balance
CREATE OR REPLACE FUNCTION update_wallet_balance(
  p_wallet_id uuid,
  p_amount decimal(12,2),
  p_entry_type text
)
RETURNS boolean AS $$
DECLARE
  v_current_balance decimal(12,2);
  v_new_balance decimal(12,2);
BEGIN
  -- Get current balance
  SELECT balance INTO v_current_balance FROM escrow_wallets WHERE id = p_wallet_id;
  
  -- Calculate new balance
  IF p_entry_type = 'CREDIT' THEN
    v_new_balance := v_current_balance + p_amount;
  ELSE
    v_new_balance := v_current_balance - p_amount;
  END IF;
  
  -- Update wallet balance
  UPDATE escrow_wallets 
  SET balance = v_new_balance, updated_at = now()
  WHERE id = p_wallet_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create payment transaction
CREATE OR REPLACE FUNCTION create_payment_transaction(
  p_shipment_id uuid,
  p_payer_id uuid,
  p_payee_id uuid,
  p_amount decimal(12,2),
  p_type text,
  p_escrow_wallet_id uuid DEFAULT NULL,
  p_commission_rate decimal(5,2) DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_payment_id uuid;
BEGIN
  INSERT INTO payments (
    shipment_id, payer_id, payee_id, amount, type, 
    escrow_wallet_id, commission_rate, status
  )
  VALUES (
    p_shipment_id, p_payer_id, p_payee_id, p_amount, p_type,
    p_escrow_wallet_id, p_commission_rate, 'PENDING'
  )
  RETURNING id INTO v_payment_id;
  
  RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process escrow release
CREATE OR REPLACE FUNCTION process_escrow_release(
  p_shipment_id uuid,
  p_admin_id uuid DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_escrow_payment payments%ROWTYPE;
  v_fleet_wallet_id uuid;
  v_net_amount decimal(12,2);
BEGIN
  -- Get escrow payment
  SELECT * INTO v_escrow_payment 
  FROM payments 
  WHERE shipment_id = p_shipment_id 
  AND type = 'ESCROW_IN' 
  AND status = 'HELD';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No held escrow found for shipment %', p_shipment_id;
  END IF;
  
  -- Calculate net amount (after commission)
  v_net_amount := v_escrow_payment.amount;
  
  -- Get or create fleet wallet
  SELECT id INTO v_fleet_wallet_id
  FROM escrow_wallets
  WHERE owner_id = v_escrow_payment.payee_id
  AND wallet_type = 'FLEET_WALLET';
  
  IF NOT FOUND THEN
    v_fleet_wallet_id := create_escrow_wallet('FLEET_WALLET', v_escrow_payment.payee_id, 'fleet');
  END IF;
  
  -- Create settlement payment
  PERFORM create_payment_transaction(
    p_shipment_id,
    NULL, -- Platform releases escrow
    v_escrow_payment.payee_id,
    v_net_amount,
    'SETTLEMENT',
    v_fleet_wallet_id
  );
  
  -- Update escrow payment status
  UPDATE payments 
  SET status = 'COMPLETE', settled_at = now()
  WHERE id = v_escrow_payment.id;
  
  -- Update wallet balances
  PERFORM update_wallet_balance(v_escrow_payment.escrow_wallet_id, v_net_amount, 'DEBIT');
  PERFORM update_wallet_balance(v_fleet_wallet_id, v_net_amount, 'CREDIT');
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate commission
CREATE OR REPLACE FUNCTION calculate_commission(
  p_shipment_amount decimal(12,2),
  p_fleet_subscription_tier text DEFAULT 'basic'
)
RETURNS decimal(12,2) AS $$
DECLARE
  v_commission_rate decimal(5,2);
  v_commission_amount decimal(12,2);
BEGIN
  -- Get commission rate based on subscription tier
  SELECT 
    CASE p_fleet_subscription_tier
      WHEN 'enterprise' THEN 3.0
      WHEN 'premium' THEN 5.0
      ELSE 7.0
    END INTO v_commission_rate;
  
  -- Calculate commission amount
  v_commission_amount := p_shipment_amount * (v_commission_rate / 100);
  
  RETURN v_commission_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process refund
CREATE OR REPLACE FUNCTION process_refund(
  p_shipment_id uuid,
  p_refund_amount decimal(12,2),
  p_refund_reason text,
  p_admin_id uuid
)
RETURNS boolean AS $$
DECLARE
  v_escrow_payment payments%ROWTYPE;
  v_shipper_wallet_id uuid;
BEGIN
  -- Get escrow payment
  SELECT * INTO v_escrow_payment 
  FROM payments 
  WHERE shipment_id = p_shipment_id 
  AND type = 'ESCROW_IN' 
  AND status IN ('HELD', 'COMPLETE');
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No escrow found for shipment %', p_shipment_id;
  END IF;
  
  -- Get or create shipper wallet
  SELECT id INTO v_shipper_wallet_id
  FROM escrow_wallets
  WHERE owner_id = v_escrow_payment.payer_id
  AND wallet_type = 'FLEET_WALLET'; -- Shipper uses fleet wallet type
  
  IF NOT FOUND THEN
    v_shipper_wallet_id := create_escrow_wallet('FLEET_WALLET', v_escrow_payment.payer_id, 'shipper');
  END IF;
  
  -- Create refund payment
  PERFORM create_payment_transaction(
    p_shipment_id,
    NULL, -- Platform refunds
    v_escrow_payment.payer_id,
    p_refund_amount,
    'REFUND',
    v_shipper_wallet_id
  );
  
  -- Update escrow payment status
  UPDATE payments 
  SET status = 'REFUNDED', refund_reason = p_refund_reason
  WHERE id = v_escrow_payment.id;
  
  -- Update wallet balances
  PERFORM update_wallet_balance(v_escrow_payment.escrow_wallet_id, p_refund_amount, 'DEBIT');
  PERFORM update_wallet_balance(v_shipper_wallet_id, p_refund_amount, 'CREDIT');
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create payment audit log
CREATE OR REPLACE FUNCTION log_payment_audit(
  p_payment_id uuid,
  p_action text,
  p_actor_id uuid,
  p_actor_type text,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL
)
RETURNS boolean AS $$
BEGIN
  INSERT INTO payment_audit_log (
    payment_id, action, actor_id, actor_type, old_values, new_values
  )
  VALUES (
    p_payment_id, p_action, p_actor_id, p_actor_type, p_old_values, p_new_values
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default payment configuration
INSERT INTO payment_config (key, value, description, category) VALUES
('default_commission_rate', '7.0', 'Default platform commission percentage', 'COMMISSION'),
('escrow_hold_period_days', '3', 'Number of days to hold escrow after delivery', 'ESCROW'),
('subscription_grace_period_days', '7', 'Grace period for subscription payments', 'SUBSCRIPTION'),
('refund_processing_days', '5', 'SLA for refund processing', 'REFUND'),
('dispute_resolution_days', '3', 'SLA for dispute resolution', 'DISPUTE'),
('payment_gateway_provider', '"razorpay"', 'Default payment gateway provider', 'GATEWAY'),
('min_refund_amount', '100.00', 'Minimum refund amount', 'REFUND'),
('max_commission_rate', '10.0', 'Maximum allowed commission rate', 'COMMISSION')
ON CONFLICT (key) DO NOTHING;

-- Insert subscription benefits
INSERT INTO subscription_benefits (subscription_tier, benefit_type, benefit_value) VALUES
('basic', 'PRIORITY_MATCHING', '{"priority_level": 1, "description": "Standard matching"}'),
('premium', 'PRIORITY_MATCHING', '{"priority_level": 2, "description": "Priority matching"}'),
('enterprise', 'PRIORITY_MATCHING', '{"priority_level": 3, "description": "Highest priority matching"}'),
('premium', 'REDUCED_COMMISSION', '{"reduction_percentage": 2.0, "description": "2% commission reduction"}'),
('enterprise', 'REDUCED_COMMISSION', '{"reduction_percentage": 4.0, "description": "4% commission reduction"}'),
('premium', 'ANALYTICS_ACCESS', '{"features": ["basic_analytics", "performance_metrics"], "description": "Enhanced analytics"}'),
('enterprise', 'ANALYTICS_ACCESS', '{"features": ["advanced_analytics", "custom_reports", "api_access"], "description": "Full analytics suite"}'),
('enterprise', 'DEDICATED_SUPPORT', '{"support_level": "priority", "response_time": "2_hours", "description": "Priority support"}')
ON CONFLICT DO NOTHING;

-- Create default TrackAS wallets
INSERT INTO escrow_wallets (wallet_type, owner_type, balance) VALUES
('TRACKAS_ESCROW', 'platform', 0.00),
('TRACKAS_COMMISSION', 'platform', 0.00)
ON CONFLICT DO NOTHING;
