import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { overtimeCategories } from '@/types/overtime';
import { calculateDuration, formatDuration } from '@/utils/timeUtils';
import { toast } from 'sonner';
import { OvertimeRequestDisplay, User } from '@/types/overtime';
import { ClipboardList, Loader2 } from 'lucide-react';
import { OvertimeService } from '@/services/overtimeService';
import { UserService } from '@/services/userService';

interface OvertimeFormProps {
  currentUser: User;
  onRequestSubmitted: () => void;
}

const OvertimeForm = ({ currentUser, onRequestSubmitted }: OvertimeFormProps) => {
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<User | null>(null);

  // Auto-fill times when category changes
  useEffect(() => {
    if (category) {
      const categoryData = overtimeCategories[category];
      setStartTime(categoryData.startTime);
      setEndTime(categoryData.endTime);
    } else {
      setStartTime('');
      setEndTime('');
    }
  }, [category]);

  // Calculate duration when times change
  useEffect(() => {
    if (startTime && endTime) {
      const calculatedDuration = calculateDuration(startTime, endTime);
      setDuration(calculatedDuration);
    } else {
      setDuration(0);
    }
  }, [startTime, endTime]);

  // Load user details
  useEffect(() => {
    const loadUserDetails = async () => {
      try {
        const user = await UserService.getUserByNik(currentUser.nik);
        setUserDetails(user);
      } catch (error) {
        console.error('Error loading user details:', error);
        toast.error('Gagal memuat data user');
      }
    };

    loadUserDetails();
  }, [currentUser.nik]);

  const handleSubmit = async () => {
    if (!category || !date || !startTime || !endTime || !reason.trim()) {
      toast.error('Mohon lengkapi semua field');
      return;
    }

    if (duration <= 0) {
      toast.error('Jam selesai harus lebih besar dari jam mulai');
      return;
    }

    if (!userDetails) {
      toast.error('Data user tidak ditemukan');
      return;
    }

    setLoading(true);

    try {
      const request: Omit<OvertimeRequestDisplay, 'id' | 'createdAt'> = {
        user_id: userDetails.nik, // This will be replaced with actual user_id in service
        nik: currentUser.nik,
        name: currentUser.name,
        category: overtimeCategories[category].name,
        categoryKey: category,
        date,
        startTime,
        endTime,
        duration: parseFloat(duration.toFixed(2)),
        reason: reason.trim(),
        status: 'pending',
        approver1Status: 'pending',
        approver2Status: 'pending',
        approver1: null,
        approver2: null,
      };

      await OvertimeService.createRequest(request);
      
      // Reset form
      setCategory('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setReason('');
      setDuration(0);
      
      toast.success('Pengajuan overtime berhasil disubmit!');
      onRequestSubmitted();
    } catch (error) {
      console.error('Error submitting overtime request:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal mengirim pengajuan overtime');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5" />
          Form Pengajuan Lembur
        </CardTitle>
        <CardDescription>
          Isi formulir di bawah untuk mengajukan lembur
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category">Kategori Overtime</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="-- Pilih Kategori --" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(overtimeCategories).map(([key, cat]) => (
                <SelectItem key={key} value={key}>
                  {cat.name} ({cat.startTime} - {cat.endTime})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Tanggal Lembur</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">Jam Mulai</Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={!category}
              className="disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">Jam Selesai</Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={!category}
              className="disabled:opacity-50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Durasi Lembur</Label>
          <div className="p-3 bg-muted rounded-md text-sm">
            {duration > 0 ? formatDuration(duration) : 'Pilih kategori dan waktu'}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Alasan / Pekerjaan</Label>
          <Textarea
            id="reason"
            rows={4}
            placeholder="Jelaskan pekerjaan yang akan dilakukan"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <Button onClick={handleSubmit} className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Mengirim...
            </>
          ) : (
            'Submit Pengajuan'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default OvertimeForm;
