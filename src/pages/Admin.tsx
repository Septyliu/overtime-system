import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Kelola data karyawan dan sistem</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Selamat Datang di Admin Panel</CardTitle>
            <CardDescription>
              Gunakan panel ini untuk mengelola data karyawan dan konfigurasi sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Pilih salah satu fungsi di bawah untuk memulai
            </p>
          </CardContent>
        </Card>

        {/* Fitur import karyawan sudah dihapus */}
      </div>
    </div>
  );
};

export default Admin;
