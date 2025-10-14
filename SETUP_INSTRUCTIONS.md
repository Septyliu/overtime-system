# Setup Instructions - Overtime Management System

## Prerequisites
- Node.js (v18 atau lebih baru)
- npm atau yarn
- Supabase account

## 1. Database Setup

### Step 1: Create Supabase Project
1. Go to [Supabase](https://supabase.com)
2. Create new project
3. Note down your project URL dan anon key

### Step 2: Run Database Migrations
1. Go to Supabase Dashboard > SQL Editor
2. Run migration files in order:
   - Copy content from `supabase/migrations/001_initial_schema.sql`
   - Paste and execute
   - Copy content from `supabase/migrations/002_constraints_and_validation.sql`
   - Paste and execute

### Step 3: Verify Database Setup
1. Check Tables section in Supabase Dashboard
2. Verify all tables are created: `profiles`, `user_roles`, `overtime_requests`
3. Check sample data is inserted

## 2. Application Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Configuration
Create `.env` file in root directory:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### Step 3: Start Development Server
```bash
npm run dev
```

## 3. Testing the Application

### Sample Users for Testing
- **Employee**: NIK `EMP001`, Name `John Doe`
- **Approver 1**: NIK `APP001`, Name `Jane Smith`
- **Approver 2**: NIK `APP002`, Name `Bob Johnson`
- **Admin**: NIK `ADM001`, Name `Alice Brown`

### Test Scenarios

#### 1. Employee Workflow
1. Login dengan NIK `EMP001`
2. Go to "Submit Overtime" tab
3. Fill form dan submit
4. Verify request appears in monitoring

#### 2. Approver 1 Workflow
1. Login dengan NIK `APP001`
2. Go to "Approval" tab
3. See pending requests
4. Approve atau reject request
5. Verify status update

#### 3. Approver 2 Workflow
1. Login dengan NIK `APP002`
2. Go to "Approval" tab
3. See requests approved by Approver 1
4. Approve atau reject request
5. Verify final status

#### 4. Admin Workflow
1. Login dengan NIK `ADM001`
2. Access all tabs
3. Monitor all requests
4. Generate reports

## 4. Key Features Implemented

### ✅ Database Integration
- Full CRUD operations dengan Supabase
- Real-time data persistence
- Proper error handling

### ✅ 2-Level Approval System
- Role-based access control
- Workflow validation
- Audit trail

### ✅ Data Validation
- Duplicate prevention
- Time validation
- Input sanitization

### ✅ User Experience
- Loading states
- Toast notifications
- Responsive design
- Error handling

### ✅ Reporting
- Monthly reports
- CSV export
- Statistics dashboard

## 5. Troubleshooting

### Common Issues

#### Database Connection Error
- Check Supabase URL dan API key
- Verify project is active
- Check network connectivity

#### Permission Denied
- Verify RLS policies are enabled
- Check user authentication
- Verify role assignments

#### Data Not Loading
- Check browser console for errors
- Verify database functions
- Check Supabase logs

### Debug Steps
1. Open browser dev tools
2. Check Network tab for failed requests
3. Check Console for error messages
4. Verify Supabase dashboard for data

## 6. Production Deployment

### Environment Variables
Set production environment variables:
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_production_anon_key
```

### Build Application
```bash
npm run build
```

### Deploy
Deploy the `dist` folder to your hosting platform (Vercel, Netlify, etc.)

## 7. Maintenance

### Database Maintenance
- Regular backup of Supabase data
- Monitor database performance
- Update RLS policies as needed

### Application Maintenance
- Update dependencies regularly
- Monitor error logs
- Performance optimization

## 8. Support

For issues or questions:
1. Check this documentation
2. Review error logs
3. Check Supabase documentation
4. Contact development team
