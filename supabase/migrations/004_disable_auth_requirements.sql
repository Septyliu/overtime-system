-- Disable authentication requirements for development
-- This allows the app to work without Supabase Auth

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow all operations on profiles" ON profiles;
DROP POLICY IF EXISTS "Allow all operations on user_roles" ON user_roles;
DROP POLICY IF EXISTS "Allow all operations on overtime_requests" ON overtime_requests;

-- Disable RLS temporarily for development
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE overtime_requests DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to public (for development only)
GRANT ALL ON profiles TO public;
GRANT ALL ON user_roles TO public;
GRANT ALL ON overtime_requests TO public;

-- Grant permissions on sequences
GRANT USAGE, SELECT ON SEQUENCE overtime_requests_id_seq TO public;

-- Grant permissions on functions
GRANT EXECUTE ON FUNCTION get_user_role TO public;
GRANT EXECUTE ON FUNCTION has_role TO public;
GRANT EXECUTE ON FUNCTION get_pending_requests_for_approver TO public;
GRANT EXECUTE ON FUNCTION update_overtime_status TO public;
GRANT EXECUTE ON FUNCTION validate_overtime_request TO public;
GRANT EXECUTE ON FUNCTION get_overtime_statistics TO public;
GRANT EXECUTE ON FUNCTION get_user_overtime_report TO public;

-- Grant permissions on views
GRANT SELECT ON overtime_requests_with_details TO public;

-- Note: This is for development only. In production, you should:
-- 1. Enable RLS
-- 2. Create proper authentication policies
-- 3. Use proper user authentication instead of anonymous access
