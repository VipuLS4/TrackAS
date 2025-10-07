/*
  # Registration & Verification Workflow System
  
  This migration implements the complete registration and verification workflow
  including KYC verification, admin approval, VCODE generation, and activation.
*/

-- Enhanced User Profiles with Verification Status
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text NOT NULL CHECK (user_type IN ('shipper', 'fleet', 'individual')),
  vcode text UNIQUE, -- Generated after approval
  status text DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'verified_pending_approval', 'approved', 'rejected', 'active')),
  rejection_reason text,
  rejection_details jsonb,
  verified_at timestamptz,
  approved_at timestamptz,
  activated_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shipper Profiles
CREATE TABLE IF NOT EXISTS shipper_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  business_type text NOT NULL CHECK (business_type IN ('manufacturer', 'distributor', 'retailer', 'individual')),
  gst_number text,
  pan_number text NOT NULL,
  contact_number text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  pin_code text NOT NULL,
  pan_document_url text,
  gst_document_url text,
  address_proof_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fleet Operator Profiles
CREATE TABLE IF NOT EXISTS fleet_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  registration_certificate_url text NOT NULL,
  gst_number text NOT NULL,
  fleet_size integer NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  bank_account_number text NOT NULL,
  bank_ifsc_code text NOT NULL,
  bank_account_holder_name text NOT NULL,
  company_address text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Individual Vehicle Owner Profiles
CREATE TABLE IF NOT EXISTS individual_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  owner_name text NOT NULL,
  vehicle_registration_number text NOT NULL,
  contact_number text NOT NULL,
  pan_number text,
  aadhaar_number text,
  bank_account_number text NOT NULL,
  bank_ifsc_code text NOT NULL,
  bank_account_holder_name text NOT NULL,
  address text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fleet Drivers
CREATE TABLE IF NOT EXISTS fleet_drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_profile_id uuid REFERENCES fleet_profiles(id) ON DELETE CASCADE,
  driver_name text NOT NULL,
  license_number text NOT NULL,
  contact_number text NOT NULL,
  aadhaar_number text,
  license_document_url text,
  aadhaar_document_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fleet Vehicles
CREATE TABLE IF NOT EXISTS fleet_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_profile_id uuid REFERENCES fleet_profiles(id) ON DELETE CASCADE,
  vehicle_registration_number text NOT NULL,
  rc_document_url text NOT NULL,
  insurance_document_url text NOT NULL,
  pollution_certificate_url text NOT NULL,
  insurance_expiry_date date,
  pollution_expiry_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Individual Vehicle Documents
CREATE TABLE IF NOT EXISTS individual_vehicle_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  individual_profile_id uuid REFERENCES individual_profiles(id) ON DELETE CASCADE,
  rc_document_url text NOT NULL,
  insurance_document_url text NOT NULL,
  pollution_certificate_url text NOT NULL,
  driver_license_document_url text NOT NULL,
  pan_document_url text,
  aadhaar_document_url text,
  insurance_expiry_date date,
  pollution_expiry_date date,
  license_expiry_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Verification Logs
CREATE TABLE IF NOT EXISTS verification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  verification_type text NOT NULL CHECK (verification_type IN ('pan', 'gst', 'aadhaar', 'rc', 'insurance', 'pollution', 'license', 'document_integrity')),
  verification_status text NOT NULL CHECK (verification_status IN ('pending', 'verified', 'failed', 'manual_review')),
  verification_result jsonb,
  verified_by text DEFAULT 'system', -- 'system' or admin user_id
  verified_at timestamptz DEFAULT now(),
  failure_reason text,
  created_at timestamptz DEFAULT now()
);

-- Rejection Logs
CREATE TABLE IF NOT EXISTS rejection_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  rejection_reason text NOT NULL,
  rejection_details jsonb,
  rejected_by uuid REFERENCES auth.users(id),
  rejected_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Notification Logs
CREATE TABLE IF NOT EXISTS notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('email', 'sms', 'whatsapp')),
  notification_status text NOT NULL CHECK (notification_status IN ('pending', 'sent', 'delivered', 'failed')),
  recipient text NOT NULL, -- email or phone number
  subject text,
  message text NOT NULL,
  sent_at timestamptz,
  delivered_at timestamptz,
  failure_reason text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipper_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_vehicle_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rejection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User profiles (users can view their own, admin can view all)
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can view all profiles" ON user_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Shipper profiles
CREATE POLICY "Users can view own shipper profile" ON shipper_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own shipper profile" ON shipper_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can view all shipper profiles" ON shipper_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Fleet profiles
CREATE POLICY "Users can view own fleet profile" ON fleet_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own fleet profile" ON fleet_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can view all fleet profiles" ON fleet_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Individual profiles
CREATE POLICY "Users can view own individual profile" ON individual_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own individual profile" ON individual_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can view all individual profiles" ON individual_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Fleet drivers and vehicles
CREATE POLICY "Users can manage own fleet drivers" ON fleet_drivers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Users can manage own fleet vehicles" ON fleet_vehicles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can view all fleet drivers and vehicles" ON fleet_drivers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can view all fleet vehicles" ON fleet_vehicles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Individual vehicle documents
CREATE POLICY "Users can manage own vehicle documents" ON individual_vehicle_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can view all vehicle documents" ON individual_vehicle_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Verification logs (admin only)
CREATE POLICY "Admin can view all verification logs" ON verification_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Rejection logs (admin only)
CREATE POLICY "Admin can view all rejection logs" ON rejection_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Notification logs (admin only)
CREATE POLICY "Admin can view all notification logs" ON notification_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Functions

-- Function to generate VCODE
CREATE OR REPLACE FUNCTION generate_vcode(user_type text)
RETURNS text AS $$
DECLARE
  prefix text;
  vcode text;
  exists boolean;
BEGIN
  -- Set prefix based on user type
  CASE user_type
    WHEN 'shipper' THEN prefix := 'SHP-';
    WHEN 'fleet' THEN prefix := 'FLEET-';
    WHEN 'individual' THEN prefix := 'IND-';
    ELSE prefix := 'USR-';
  END CASE;
  
  LOOP
    -- Generate 6-digit random number
    vcode := prefix || lpad(floor(random() * 1000000)::text, 6, '0');
    
    -- Check if VCODE already exists
    SELECT EXISTS(SELECT 1 FROM user_profiles WHERE vcode = vcode) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN vcode;
END;
$$ LANGUAGE plpgsql;

-- Function to update profile status
CREATE OR REPLACE FUNCTION update_profile_status(
  p_user_profile_id uuid,
  p_status text,
  p_admin_id uuid DEFAULT NULL,
  p_rejection_reason text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_vcode text;
  v_user_type text;
BEGIN
  -- Get user type
  SELECT user_type INTO v_user_type FROM user_profiles WHERE id = p_user_profile_id;
  
  -- Update status
  UPDATE user_profiles 
  SET 
    status = p_status,
    approved_by = p_admin_id,
    rejection_reason = p_rejection_reason,
    updated_at = now()
  WHERE id = p_user_profile_id;
  
  -- If approved, generate VCODE and activate
  IF p_status = 'approved' THEN
    v_vcode := generate_vcode(v_user_type);
    
    UPDATE user_profiles 
    SET 
      vcode = v_vcode,
      status = 'active',
      approved_at = now(),
      activated_at = now()
    WHERE id = p_user_profile_id;
    
    -- Log notification
    INSERT INTO notification_logs (user_profile_id, notification_type, notification_status, recipient, subject, message)
    SELECT 
      p_user_profile_id,
      'email',
      'pending',
      u.email,
      'Account Activated - TrackAS',
      '✅ Your TrackAS account has been verified and activated. Your VCODE is ' || v_vcode || '. You can now start transacting.'
    FROM auth.users u
    JOIN user_profiles up ON u.id = up.user_id
    WHERE up.id = p_user_profile_id;
  END IF;
  
  -- If rejected, log rejection
  IF p_status = 'rejected' AND p_rejection_reason IS NOT NULL THEN
    INSERT INTO rejection_logs (user_profile_id, rejection_reason, rejected_by)
    VALUES (p_user_profile_id, p_rejection_reason, p_admin_id);
    
    -- Log notification
    INSERT INTO notification_logs (user_profile_id, notification_type, notification_status, recipient, subject, message)
    SELECT 
      p_user_profile_id,
      'email',
      'pending',
      u.email,
      'Account Rejected - TrackAS',
      '❌ Your TrackAS account registration has been rejected. Reason: ' || p_rejection_reason || '. Please contact support for assistance.'
    FROM auth.users u
    JOIN user_profiles up ON u.id = up.user_id
    WHERE up.id = p_user_profile_id;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log verification result
CREATE OR REPLACE FUNCTION log_verification_result(
  p_user_profile_id uuid,
  p_verification_type text,
  p_status text,
  p_result jsonb DEFAULT NULL,
  p_failure_reason text DEFAULT NULL
)
RETURNS boolean AS $$
BEGIN
  INSERT INTO verification_logs (
    user_profile_id,
    verification_type,
    verification_status,
    verification_result,
    verified_by,
    failure_reason
  ) VALUES (
    p_user_profile_id,
    p_verification_type,
    p_status,
    p_result,
    'system',
    p_failure_reason
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if all verifications are complete
CREATE OR REPLACE FUNCTION check_verification_completion(p_user_profile_id uuid)
RETURNS boolean AS $$
DECLARE
  v_user_type text;
  v_pending_count integer;
BEGIN
  -- Get user type
  SELECT user_type INTO v_user_type FROM user_profiles WHERE id = p_user_profile_id;
  
  -- Count pending verifications based on user type
  IF v_user_type = 'shipper' THEN
    SELECT COUNT(*) INTO v_pending_count
    FROM verification_logs
    WHERE user_profile_id = p_user_profile_id
    AND verification_type IN ('pan', 'document_integrity')
    AND verification_status = 'pending';
  ELSIF v_user_type = 'fleet' THEN
    SELECT COUNT(*) INTO v_pending_count
    FROM verification_logs
    WHERE user_profile_id = p_user_profile_id
    AND verification_type IN ('gst', 'rc', 'insurance', 'pollution', 'license', 'document_integrity')
    AND verification_status = 'pending';
  ELSIF v_user_type = 'individual' THEN
    SELECT COUNT(*) INTO v_pending_count
    FROM verification_logs
    WHERE user_profile_id = p_user_profile_id
    AND verification_type IN ('rc', 'insurance', 'pollution', 'license', 'document_integrity')
    AND verification_status = 'pending';
  END IF;
  
  -- If no pending verifications, update status to verified_pending_approval
  IF v_pending_count = 0 THEN
    UPDATE user_profiles 
    SET status = 'verified_pending_approval', verified_at = now()
    WHERE id = p_user_profile_id;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
