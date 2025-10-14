# Quick Setup untuk Testing

## 1. Database Setup (Supabase)

### Step 1: Jalankan Migration Files
1. Buka Supabase Dashboard > SQL Editor
2. Jalankan file `001_initial_schema.sql`
3. Jalankan file `002_constraints_and_validation_fixed.sql`
4. Jalankan file `003_fix_rls_policies.sql`

### Step 2: Verifikasi Setup
- Check Tables: `profiles`, `user_roles`, `overtime_requests`
- Check sample data sudah ter-insert
- Check RLS policies sudah di-disable untuk testing

## 2. Environment Variables

Buat file `.env` di root project:
```env
VITE_SUPABASE_URL=https://xibbwxkabmoemkhuxotr.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

## 3. Test Users

Gunakan sample users yang sudah ada:
- **Employee**: NIK `EMP001`, Name `John Doe`
- **Approver 1**: NIK `APP001`, Name `Jane Smith`
- **Approver 2**: NIK `APP002`, Name `Bob Johnson`
- **Admin**: NIK `ADM001`, Name `Alice Brown`

## 4. Testing Flow

1. **Start aplikasi**: `npm run dev`
2. **Login** dengan salah satu NIK di atas
3. **Test submit overtime** sebagai employee
4. **Test approval** sebagai approver
5. **Test monitoring** dan reporting

## 5. Troubleshooting

### Error 401 Unauthorized
- Pastikan RLS policies sudah di-disable
- Check environment variables
- Restart aplikasi setelah update .env

### Error Database Connection
- Check Supabase URL dan API key
- Verify project status di Supabase dashboard

### Error RLS Policy
- Jalankan migration `003_fix_rls_policies.sql`
- Check policies di Supabase dashboard

## 6. Next Steps

Setelah testing berhasil:
1. Implement proper authentication
2. Re-enable RLS policies dengan auth
3. Add proper user management
4. Deploy ke production
