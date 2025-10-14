import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const roles = [
  { value: 'employee', label: 'Karyawan' },
  { value: 'approver1', label: 'Approver 1' },
  { value: 'approver2', label: 'Approver 2' },
  { value: 'admin', label: 'Admin' },
];

export default function AddUserForm({ currentUser }: { currentUser: { role: string } }) {
  const [form, setForm] = useState({
    nik: '',
    name: '',
    email: '',
    password: '',
    pickup_point: '',
    role: 'employee',
  });
  const [loading, setLoading] = useState(false);

  if (currentUser.role !== 'admin') {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // 1. Buat user di Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: form.email,
      password: form.password,
      email_confirm: true,
      user_metadata: {
        nik: form.nik,
        name: form.name,
        pickup_point: form.pickup_point,
      },
    });
    if (authError || !authData?.user) {
      toast.error('Gagal membuat user: ' + (authError?.message || '')); setLoading(false); return;
    }
    const userId = authData.user.id;
    // 2. Insert ke profiles
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      nik: form.nik,
      name: form.name,
      pickup_point: form.pickup_point,
    });
    if (profileError) {
      toast.error('Gagal insert ke profiles: ' + profileError.message); setLoading(false); return;
    }
    // 3. Insert ke user_roles
    const { error: roleError } = await supabase.from('user_roles').insert({
      user_id: userId,
      role: form.role as 'employee' | 'approver1' | 'approver2' | 'admin',
    });
    if (roleError) {
      toast.error('Gagal insert ke user_roles: ' + roleError.message); setLoading(false); return;
    }
    toast.success('User berhasil ditambahkan!');
    setForm({ nik: '', name: '', email: '', password: '', pickup_point: '', role: 'employee' });
    setLoading(false);
  };

  return (
    <Card className="my-6">
      <CardHeader>
        <CardTitle>Tambah User Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nik">NIK</Label>
            <Input id="nik" name="nik" value={form.nik} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="name">Nama</Label>
            <Input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="pickup_point">Pickup Point</Label>
            <Input id="pickup_point" name="pickup_point" value={form.pickup_point} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <select id="role" name="role" value={form.role} onChange={handleChange} className="w-full border rounded p-2">
              {roles.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Menyimpan...' : 'Tambah User'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
