-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE app_role AS ENUM ('employee', 'approver1', 'approver2', 'admin');
CREATE TYPE overtime_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nik VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    pickup_point VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'employee',
    approver1_nik VARCHAR(20) REFERENCES profiles(nik),
    approver2_nik VARCHAR(20) REFERENCES profiles(nik),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create overtime_requests table
CREATE TABLE overtime_requests (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    nik VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    category_key VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration DECIMAL(4,2) NOT NULL,
    reason TEXT NOT NULL,
    status overtime_status DEFAULT 'pending',
    approver1_status overtime_status DEFAULT 'pending',
    approver2_status overtime_status DEFAULT 'pending',
    approver1_name VARCHAR(255),
    approver2_name VARCHAR(255),
    approver1_approved_at TIMESTAMP WITH TIME ZONE,
    approver2_approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_nik ON profiles(nik);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_overtime_requests_user_id ON overtime_requests(user_id);
CREATE INDEX idx_overtime_requests_nik ON overtime_requests(nik);
CREATE INDEX idx_overtime_requests_date ON overtime_requests(date);
CREATE INDEX idx_overtime_requests_status ON overtime_requests(status);
CREATE INDEX idx_overtime_requests_approver1_status ON overtime_requests(approver1_status);
CREATE INDEX idx_overtime_requests_approver2_status ON overtime_requests(approver2_status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_overtime_requests_updated_at BEFORE UPDATE ON overtime_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to get user role
CREATE OR REPLACE FUNCTION get_user_role(_user_id UUID)
RETURNS app_role AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM user_roles 
        WHERE user_id = _user_id
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION has_role(_role app_role, _user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT EXISTS(
            SELECT 1 
            FROM user_roles 
            WHERE user_id = _user_id AND role = _role
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to get approvers for a user
CREATE OR REPLACE FUNCTION get_user_approvers(_user_id UUID)
RETURNS TABLE(approver1_nik VARCHAR, approver2_nik VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT ur.approver1_nik, ur.approver2_nik
    FROM user_roles ur
    WHERE ur.user_id = _user_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update overtime request status
CREATE OR REPLACE FUNCTION update_overtime_status(
    _request_id INTEGER,
    _approver_role app_role,
    _approver_name VARCHAR,
    _status overtime_status
)
RETURNS BOOLEAN AS $$
DECLARE
    current_request RECORD;
BEGIN
    -- Get current request
    SELECT * INTO current_request 
    FROM overtime_requests 
    WHERE id = _request_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update based on approver role
    IF _approver_role = 'approver1' THEN
        UPDATE overtime_requests 
        SET 
            approver1_status = _status,
            approver1_name = _approver_name,
            approver1_approved_at = CASE WHEN _status = 'approved' THEN NOW() ELSE NULL END,
            updated_at = NOW()
        WHERE id = _request_id;
        
        -- If rejected, set final status to rejected
        IF _status = 'rejected' THEN
            UPDATE overtime_requests 
            SET status = 'rejected', updated_at = NOW()
            WHERE id = _request_id;
        END IF;
        
    ELSIF _approver_role = 'approver2' THEN
        -- Check if approver1 has approved
        IF current_request.approver1_status != 'approved' THEN
            RETURN FALSE;
        END IF;
        
        UPDATE overtime_requests 
        SET 
            approver2_status = _status,
            approver2_name = _approver_name,
            approver2_approved_at = CASE WHEN _status = 'approved' THEN NOW() ELSE NULL END,
            status = _status,
            updated_at = NOW()
        WHERE id = _request_id;
        
    ELSIF _approver_role = 'admin' THEN
        -- Admin can approve/reject directly
        UPDATE overtime_requests 
        SET 
            approver1_status = _status,
            approver2_status = _status,
            approver1_name = _approver_name,
            approver2_name = _approver_name,
            approver1_approved_at = CASE WHEN _status = 'approved' THEN NOW() ELSE NULL END,
            approver2_approved_at = CASE WHEN _status = 'approved' THEN NOW() ELSE NULL END,
            status = _status,
            updated_at = NOW()
        WHERE id = _request_id;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtime_requests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view all user roles" ON user_roles
    FOR SELECT USING (true);

-- Overtime requests policies
CREATE POLICY "Users can view all overtime requests" ON overtime_requests
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own overtime requests" ON overtime_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own overtime requests" ON overtime_requests
    FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample data for testing
INSERT INTO profiles (id, nik, name, pickup_point) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'EMP001', 'John Doe', 'Jakarta'),
    ('550e8400-e29b-41d4-a716-446655440002', 'APP001', 'Jane Smith', 'Jakarta'),
    ('550e8400-e29b-41d4-a716-446655440003', 'APP002', 'Bob Johnson', 'Jakarta'),
    ('550e8400-e29b-41d4-a716-446655440004', 'ADM001', 'Alice Brown', 'Jakarta');

INSERT INTO user_roles (user_id, role, approver1_nik, approver2_nik) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'employee', 'APP001', 'APP002'),
    ('550e8400-e29b-41d4-a716-446655440002', 'approver1', NULL, 'APP002'),
    ('550e8400-e29b-41d4-a716-446655440003', 'approver2', NULL, NULL),
    ('550e8400-e29b-41d4-a716-446655440004', 'admin', NULL, NULL);
