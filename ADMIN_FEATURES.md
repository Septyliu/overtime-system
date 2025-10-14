# Admin Features - Overtime Management System

## 🎯 Overview
Fitur admin yang ditambahkan untuk mengelola user dan approval dalam sistem overtime management.

## 🔧 Features

### 1. User Management
**Tab: "Manage Users"**

#### Capabilities:
- ✅ **View All Users**: Tampilkan semua user dengan detail lengkap
- ✅ **Add New User**: Tambah user baru dengan role dan approver
- ✅ **Edit User**: Update informasi user dan role
- ✅ **Delete User**: Hapus user dari sistem
- ✅ **Role Management**: Assign role (employee, approver1, approver2, admin)
- ✅ **Approver Assignment**: Set approver1 dan approver2 untuk employee

#### User Form Fields:
- NIK (required)
- Name (required)
- Email (required)
- Password (required)
- Pickup Point (optional)
- Role (required)
- Approver 1 (for employees)
- Approver 2 (for employees)

### 2. Approval Management
**Tab: "Manage Approval"**

#### Capabilities:
- ✅ **View All Requests**: Tampilkan semua pengajuan overtime
- ✅ **Filter & Search**: Filter berdasarkan status, pencarian, tanggal
- ✅ **Statistics Dashboard**: Statistik pengajuan (total, pending, approved, rejected)
- ✅ **Admin Approval**: Approve/reject langsung sebagai admin
- ✅ **Bypass 2-Level Flow**: Admin bisa langsung approve tanpa melalui approver1/approver2

#### Filter Options:
- Status: All, Pending, Approved, Rejected
- Search: NIK, Name, Category
- Date: Filter berdasarkan tanggal

## 🎨 UI Components

### User Management
- **Table View**: Responsive table dengan semua user data
- **Add Dialog**: Modal form untuk tambah user baru
- **Edit Dialog**: Modal form untuk edit user existing
- **Delete Confirmation**: Alert dialog untuk konfirmasi hapus
- **Role Badges**: Color-coded badges untuk role
- **Approver Selection**: Dropdown dengan available approvers

### Approval Management
- **Statistics Cards**: 4 cards dengan statistik pengajuan
- **Filter Panel**: Card dengan filter options
- **Requests Table**: Table dengan semua pengajuan
- **Action Buttons**: Approve/Reject buttons untuk pending requests
- **Status Badges**: Color-coded status indicators

## 🔐 Access Control

### Role-Based Access
- **Admin Only**: Fitur ini hanya bisa diakses oleh user dengan role `admin`
- **Tab Visibility**: Tab "Manage Users" dan "Manage Approval" hanya muncul untuk admin
- **Permission Check**: `canAccessTab()` function memvalidasi akses

### Security Features
- **Authentication**: Semua operations menggunakan Supabase auth
- **Error Handling**: Comprehensive error handling dan user feedback
- **Data Validation**: Form validation untuk input data
- **Confirmation Dialogs**: Confirmation untuk destructive actions

## 📊 Database Integration

### Tables Used
- `profiles`: User profile data
- `user_roles`: User roles dan approver assignments
- `overtime_requests`: Overtime requests data

### Services
- `UserService`: CRUD operations untuk user management
- `OvertimeService`: Operations untuk approval management

## 🚀 Usage

### For Admin Users:
1. **Login** dengan NIK yang memiliki role `admin`
2. **Access Tabs**: Tab "Manage Users" dan "Manage Approval" akan muncul
3. **User Management**:
   - View all users
   - Add new users
   - Edit existing users
   - Delete users
   - Assign roles and approvers
4. **Approval Management**:
   - View all overtime requests
   - Filter and search requests
   - Approve/reject requests directly
   - Monitor statistics

### Sample Admin User:
- **NIK**: `ADM001`
- **Name**: `Alice Brown`
- **Role**: `admin`

## 🔄 Data Flow

### User Management Flow:
1. Admin opens "Manage Users" tab
2. `UserService.getAllUsers()` fetches all users
3. Table displays users with actions
4. Add/Edit/Delete operations update database
5. Table refreshes with updated data

### Approval Management Flow:
1. Admin opens "Manage Approval" tab
2. `OvertimeService.getAllRequests()` fetches all requests
3. Statistics calculated and displayed
4. Filters applied to requests
5. Approve/Reject operations update request status
6. Table refreshes with updated data

## 🎯 Benefits

### For Administrators:
- **Complete Control**: Full control over user management
- **Efficient Approval**: Direct approval without waiting for approvers
- **Better Monitoring**: Comprehensive view of all requests
- **User Management**: Easy user onboarding and role management

### For System:
- **Scalability**: Easy to add new users and manage roles
- **Flexibility**: Admin can override approval flow when needed
- **Transparency**: Complete visibility of all system activities
- **Maintenance**: Easy user lifecycle management

## 🔧 Technical Implementation

### Components:
- `UserManagement.tsx`: User CRUD operations
- `ApprovalManagement.tsx`: Approval management interface
- `MainApp.tsx`: Integration dengan existing tabs

### Services:
- `UserService.ts`: User-related database operations
- `OvertimeService.ts`: Overtime-related operations

### Features:
- Responsive design
- Loading states
- Error handling
- Toast notifications
- Confirmation dialogs
- Form validation

## 📝 Notes

### Current Limitations:
- User creation doesn't create Supabase Auth users (uses generated IDs)
- Password field in user creation is not used for authentication
- Admin approval bypasses the 2-level approval flow

### Future Enhancements:
- Implement proper Supabase Auth user creation
- Add user profile pictures
- Add bulk operations (bulk approve/reject)
- Add user activity logs
- Add email notifications for user actions
