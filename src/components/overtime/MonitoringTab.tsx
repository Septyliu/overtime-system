import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { OvertimeRequestDisplay, User } from '@/types/overtime';
import { CheckCircle, XCircle, Clock, TrendingUp, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { OvertimeService } from '@/services/overtimeService';

interface MonitoringTabProps {
  currentUser: User;
  onDataRefresh?: number;
}

const MonitoringTab = ({ currentUser, onDataRefresh }: MonitoringTabProps) => {
  const [requests, setRequests] = useState<OvertimeRequestDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Load overtime requests based on role
  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        let fetched: OvertimeRequestDisplay[] = [];
        if (['approver1', 'approver2', 'admin'].includes(currentUser.role)) {
          fetched = await OvertimeService.getAllRequests();
        } else {
          fetched = await OvertimeService.getRequestsByNik(currentUser.nik);
        }
        setRequests(fetched);
        
        // Calculate stats
        const newStats = {
          total: fetched.length,
          pending: fetched.filter(r => r.status === 'pending').length,
          approved: fetched.filter(r => r.status === 'approved').length,
          rejected: fetched.filter(r => r.status === 'rejected').length,
        };
        setStats(newStats);
      } catch (error) {
        console.error('Error loading overtime requests:', error);
        toast.error('Gagal memuat data monitoring');
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [currentUser.nik, currentUser.role, onDataRefresh]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-warning text-warning-foreground"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-success text-success-foreground"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-destructive text-destructive-foreground"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pengajuan</p>
                <p className="text-3xl font-bold text-primary">{stats.total}</p>
              </div>
              <FileText className="w-10 h-10 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Menunggu Approval</p>
                <p className="text-3xl font-bold text-warning">{stats.pending}</p>
              </div>
              <Clock className="w-10 h-10 text-warning opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disetujui</p>
                <p className="text-3xl font-bold text-success">{stats.approved}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-success opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ditolak</p>
                <p className="text-3xl font-bold text-destructive">{stats.rejected}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-destructive opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Monitoring Overtime</CardTitle>
          <CardDescription>
            Semua pengajuan overtime dan statusnya
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIK</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jam</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approver 1</TableHead>
                  <TableHead>Approver 2</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Memuat data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Belum ada pengajuan overtime
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.nik}</TableCell>
                      <TableCell>{request.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{request.category}</TableCell>
                      <TableCell>{new Date(request.date).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="whitespace-nowrap">{request.startTime} - {request.endTime}</TableCell>
                      <TableCell>{request.duration} jam</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        {request.approver1 || '-'}
                        {' '}
                        {getStatusBadge(request.approver1Status)}
                      </TableCell>
                      <TableCell>
                        {request.approver2 || '-'}
                        {' '}
                        {getStatusBadge(request.approver2Status)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonitoringTab;
