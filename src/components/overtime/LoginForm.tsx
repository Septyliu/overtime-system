import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, QrCode, User } from 'lucide-react';
import { User as UserType } from '@/types/overtime';
import { toast } from 'sonner';
import QRScanner from './QRScanner';
import { supabase } from '@/integrations/supabase/client';

interface LoginFormProps {
  onLogin: (user: UserType) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [nik, setNik] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!nik.trim()) {
      toast.error('Mohon masukkan NIK');
      return;
    }
    setLoading(true);
    
    try {
      // Skip authentication for now since anonymous auth is disabled
      // const { error: authError } = await supabase.auth.signInAnonymously();
      // if (authError) {
      //   console.error('Auth error:', authError);
      //   // Continue anyway, we'll handle this gracefully
      // }

      // Get user profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('nik', nik.trim())
        .single();
        
      if (error || !data) {
        toast.error('NIK tidak ditemukan');
        return;
      }
      
      // Get user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role,approver1_nik,approver2_nik')
        .eq('user_id', data.id);
        
      console.log('roleData:', roleData, 'roleError:', roleError, 'user_id:', data.id);
      
      // Create user object
      const user: UserType = {
        nik: data.nik,
        name: data.name,
        role: roleData?.[0]?.role || 'employee',
        approver1: roleData?.[0]?.approver1_nik || undefined,
        approver2: roleData?.[0]?.approver2_nik || undefined,
      };
      
      onLogin(user);
      toast.success(`Selamat datang, ${user.name}!`);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = (decodedText: string) => {
    setNik(decodedText);
    setShowScanner(false);
    handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-primary">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-4">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Overtime Management
          </h1>
          <p className="text-white/80">Sistem Pengajuan & Approval Lembur</p>
        </div>

        <Card className="shadow-lg-custom">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Login
            </CardTitle>
            <CardDescription>
              Masukkan NIK atau scan QR code untuk masuk
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showScanner ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nik">NIK (Nomor Induk Karyawan)</Label>
                  <Input
                    id="nik"
                    type="text"
                    placeholder="Masukkan NIK"
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
                <Button onClick={handleLogin} className="w-full">
                  Login
                </Button>
                <Button 
                  onClick={() => setShowScanner(true)} 
                  variant="outline" 
                  className="w-full"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan QR Code
                </Button>
              </>
            ) : (
              <QRScanner 
                onScan={handleQRScan}
                onClose={() => setShowScanner(false)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
