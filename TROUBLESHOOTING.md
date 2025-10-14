# Troubleshooting Guide

## 🔧 Common Issues and Solutions

### 1. Authentication Issues

#### Problem: "Anonymous sign-ins are disabled"
```
Error: AuthApiError: Anonymous sign-ins are disabled
```

**Solution:**
- Run migration `004_disable_auth_requirements.sql` to disable RLS
- Or enable anonymous sign-ins in Supabase Dashboard > Authentication > Settings

#### Problem: "401 Unauthorized"
```
Error: 401 (Unauthorized)
```

**Solution:**
- Check if RLS policies are properly configured
- Run migration `003_fix_rls_policies.sql` or `004_disable_auth_requirements.sql`
- Verify environment variables are correct

### 2. Database Query Issues

#### Problem: "Could not embed because more than one relationship was found"
```
Error: PGRST201: Could not embed because more than one relationship was found for 'profiles' and 'user_roles'
```

**Solution:**
- Use separate queries instead of joins
- Updated `UserService.getAllUsers()` to fetch profiles and roles separately
- Combine data in JavaScript instead of database joins

#### Problem: "new row violates row-level security policy"
```
Error: new row violates row-level security policy for table "overtime_requests"
```

**Solution:**
- Disable RLS temporarily: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`
- Or create proper RLS policies that allow operations
- Run migration `004_disable_auth_requirements.sql`

### 3. User Management Issues

#### Problem: "NIK sudah digunakan"
```
Error: NIK sudah digunakan
```

**Solution:**
- Check if NIK already exists in database
- Use different NIK for new user
- Or update existing user instead of creating new one

#### Problem: "User not found"
```
Error: User not found
```

**Solution:**
- Verify NIK exists in profiles table
- Check if user has corresponding role in user_roles table
- Ensure data integrity between tables

### 4. Environment Issues

#### Problem: "Failed to fetch users"
```
Error: Failed to fetch users
```

**Solution:**
- Check Supabase URL and API key in `.env`
- Verify project is active in Supabase Dashboard
- Check network connectivity
- Verify database tables exist

#### Problem: "Database error: relation does not exist"
```
Error: relation "profiles" does not exist
```

**Solution:**
- Run migration files in order:
  1. `001_initial_schema.sql`
  2. `002_constraints_and_validation_fixed.sql`
  3. `003_fix_rls_policies.sql`
  4. `004_disable_auth_requirements.sql`

## 🚀 Quick Fixes

### For Development (No Authentication)
1. Run migration `004_disable_auth_requirements.sql`
2. Restart application
3. Test with sample users

### For Production (With Authentication)
1. Enable Supabase Auth
2. Create proper user accounts
3. Update RLS policies
4. Remove anonymous access

## 📋 Migration Order

Run migrations in this exact order:
```sql
-- 1. Create tables and basic structure
001_initial_schema.sql

-- 2. Add constraints and functions
002_constraints_and_validation_fixed.sql

-- 3. Fix RLS policies (optional)
003_fix_rls_policies.sql

-- 4. Disable auth requirements (development only)
004_disable_auth_requirements.sql
```

## 🔍 Debugging Steps

### 1. Check Database Connection
```sql
-- Test basic connection
SELECT * FROM profiles LIMIT 1;
```

### 2. Check RLS Status
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'user_roles', 'overtime_requests');
```

### 3. Check Permissions
```sql
-- Check table permissions
SELECT * FROM information_schema.table_privileges 
WHERE table_name IN ('profiles', 'user_roles', 'overtime_requests');
```

### 4. Check Sample Data
```sql
-- Verify sample data exists
SELECT * FROM profiles;
SELECT * FROM user_roles;
```

## 🎯 Sample Users for Testing

Use these sample users for testing:
- **Employee**: NIK `EMP001`, Name `John Doe`
- **Approver 1**: NIK `APP001`, Name `Jane Smith`
- **Approver 2**: NIK `APP002`, Name `Bob Johnson`
- **Admin**: NIK `ADM001`, Name `Alice Brown`

## 📞 Support

If issues persist:
1. Check Supabase Dashboard for project status
2. Verify all migration files ran successfully
3. Check browser console for detailed error messages
4. Ensure environment variables are correct
5. Test with sample data first

## 🔒 Security Notes

**Development Mode:**
- RLS is disabled for easier development
- All operations are allowed
- No authentication required

**Production Mode:**
- Enable RLS
- Create proper authentication
- Implement proper user management
- Remove anonymous access
