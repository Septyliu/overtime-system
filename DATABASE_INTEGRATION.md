# Database Integration Guide

## Overview
Aplikasi overtime management telah diintegrasikan dengan Supabase database untuk menyediakan data persistence yang proper dan sistem 2-level approval yang robust.

## Database Schema

### Tables

#### 1. `profiles`
- `id` (UUID, Primary Key)
- `nik` (VARCHAR, Unique)
- `name` (VARCHAR)
- `pickup_point` (VARCHAR, Optional)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 2. `user_roles`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to profiles.id)
- `role` (ENUM: employee, approver1, approver2, admin)
- `approver1_nik` (VARCHAR, Optional)
- `approver2_nik` (VARCHAR, Optional)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 3. `overtime_requests`
- `id` (SERIAL, Primary Key)
- `user_id` (UUID, Foreign Key to profiles.id)
- `nik` (VARCHAR)
- `name` (VARCHAR)
- `category` (VARCHAR)
- `category_key` (VARCHAR)
- `date` (DATE)
- `start_time` (TIME)
- `end_time` (TIME)
- `duration` (DECIMAL)
- `reason` (TEXT)
- `status` (ENUM: pending, approved, rejected)
- `approver1_status` (ENUM: pending, approved, rejected)
- `approver2_status` (ENUM: pending, approved, rejected)
- `approver1_name` (VARCHAR, Optional)
- `approver2_name` (VARCHAR, Optional)
- `approver1_approved_at` (TIMESTAMP, Optional)
- `approver2_approved_at` (TIMESTAMP, Optional)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Views

#### `overtime_requests_with_details`
View yang menggabungkan data overtime_requests dengan profiles dan user_roles untuk mendapatkan informasi lengkap.

### Functions

#### 1. `get_user_role(_user_id UUID)`
Mengembalikan role user berdasarkan user_id.

#### 2. `has_role(_role app_role, _user_id UUID)`
Mengecek apakah user memiliki role tertentu.

#### 3. `get_pending_requests_for_approver(_approver_nik VARCHAR)`
Mengembalikan daftar request yang menunggu approval berdasarkan role approver.

#### 4. `update_overtime_status(_request_id INTEGER, _approver_role app_role, _approver_name VARCHAR, _status overtime_status)`
Mengupdate status overtime request dengan validasi workflow.

#### 5. `validate_overtime_request(_user_id UUID, _date DATE, _category_key VARCHAR, _start_time TIME, _end_time TIME)`
Validasi request overtime untuk mencegah duplikasi dan memastikan data valid.

#### 6. `get_overtime_statistics(_start_date DATE, _end_date DATE)`
Mengembalikan statistik overtime dalam periode tertentu.

#### 7. `get_user_overtime_report(_user_nik VARCHAR, _start_date DATE, _end_date DATE)`
Mengembalikan laporan overtime untuk user tertentu.

## Setup Instructions

### 1. Database Setup
1. Jalankan migration files di Supabase:
   - `001_initial_schema.sql`
   - `002_constraints_and_validation.sql`

### 2. Environment Variables
Buat file `.env` dengan konfigurasi Supabase:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### 3. Sample Data
Database sudah include sample data untuk testing:
- Employee: NIK "EMP001", Name "John Doe"
- Approver 1: NIK "APP001", Name "Jane Smith"
- Approver 2: NIK "APP002", Name "Bob Johnson"
- Admin: NIK "ADM001", Name "Alice Brown"

## Service Layer

### OvertimeService
- `getAllRequests()` - Get semua overtime requests
- `getUserRequests(userId)` - Get requests untuk user tertentu
- `getPendingRequestsForApprover(approverNik)` - Get pending requests untuk approver
- `createRequest(request)` - Create overtime request baru
- `updateRequestStatus(requestId, approverRole, approverName, status)` - Update status request
- `getStatistics(startDate, endDate)` - Get statistik overtime
- `getUserReport(userNik, startDate, endDate)` - Get laporan user

### UserService
- `getUserByNik(nik)` - Get user berdasarkan NIK
- `getUserById(userId)` - Get user berdasarkan ID
- `getAllUsers()` - Get semua users
- `getUsersByRole(role)` - Get users berdasarkan role
- `createUser(userData)` - Create user baru
- `updateUserRole(userId, role, approver1_nik, approver2_nik)` - Update role user
- `hasRole(userId, role)` - Cek apakah user memiliki role tertentu

## Key Features

### 1. Data Persistence
- Semua data tersimpan di database Supabase
- Real-time updates menggunakan Supabase subscriptions
- Proper error handling dan loading states

### 2. 2-Level Approval System
- Workflow approval yang konsisten
- Validasi role-based access
- Audit trail dengan timestamp approval

### 3. Data Validation
- Duplicate prevention
- Time validation
- Role hierarchy validation
- Database constraints

### 4. Performance Optimization
- Database indexes untuk query optimization
- Efficient data fetching dengan proper filtering
- Caching strategy dengan React state management

## Error Handling

### Database Errors
- Connection errors
- Validation errors
- Permission errors
- Duplicate submission errors

### User Experience
- Loading states untuk semua async operations
- Toast notifications untuk feedback
- Proper error messages dalam bahasa Indonesia
- Graceful fallbacks

## Security

### Row Level Security (RLS)
- Policies untuk data access control
- User-specific data filtering
- Role-based permissions

### Data Validation
- Server-side validation dengan database functions
- Client-side validation untuk UX
- Input sanitization

## Testing

### Manual Testing
1. Login dengan sample users
2. Submit overtime request sebagai employee
3. Approve/reject sebagai approver1
4. Approve/reject sebagai approver2
5. Monitor data di monitoring tab
6. Generate reports

### Database Testing
1. Test semua database functions
2. Verify constraints dan validations
3. Test RLS policies
4. Performance testing dengan large datasets

## Troubleshooting

### Common Issues
1. **Connection Error**: Check Supabase URL dan API key
2. **Permission Denied**: Verify RLS policies
3. **Validation Error**: Check input data format
4. **Duplicate Error**: Verify unique constraints

### Debug Tips
1. Check browser console untuk error messages
2. Verify Supabase logs
3. Test database functions langsung di Supabase dashboard
4. Check network requests di browser dev tools
