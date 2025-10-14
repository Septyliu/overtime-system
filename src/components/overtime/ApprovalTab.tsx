import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { OvertimeRequestDisplay, User } from '@/types/overtime';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { OvertimeService } from '@/services/overtimeService';

interface ApprovalTabProps {
  currentUser: User;
  onRequestUpdated: () => void;
}

const ApprovalTab = ({ currentUser, onRequestUpdated }: ApprovalTabProps) => {
  const [requests, setRequests] = useState<OvertimeRequestDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Load pending requests for the current user
  useEffect(() => {
    const loadPendingRequests = async () => {
      try {
        setLoading(true);
        const pendingRequests = await OvertimeService.getPendingRequestsForApprover(currentUser.nik);
        setRequests(pendingRequests);
      } catch (error) {
        console.error('Error loading pending requests:', error);
        toast.error('Gagal memuat data pengajuan');
      } finally {
        setLoading(false);
      }
    };

    loadPendingRequests();
  }, [currentUser.nik, onRequestUpdated]);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      const success = await OvertimeService.updateRequestStatus(
        id,
        currentUser.role as 'approver1' | 'approver2' | 'admin',
        currentUser.name,
        'approved'
      );

      if (success) {
        toast.success('Overtime berhasil di-approve');
        onRequestUpdated();
      } else {
        toast.error('Gagal meng-approve overtime');
      }
    } catch (error) {
      console.error('Error approving overtime request:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal meng-approve overtime');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    try {
      const success = await OvertimeService.updateRequestStatus(
        id,
        currentUser.role as 'approver1' | 'approver2' | 'admin',
        currentUser.name,
        'rejected'
      );

      if (success) {
        toast.error('Overtime ditolak');
        onRequestUpdated();
      } else {
        toast.error('Gagal menolak overtime');
      }
    } catch (error) {
      console.error('Error rejecting overtime request:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal menolak overtime');
    } finally {
      setActionLoading(null);
    }
  };

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
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Daftar Pengajuan Menunggu Approval</CardTitle>
        <CardDescription>
          {loading ? 'Memuat data...' : `${requests.length} pengajuan menunggu approval Anda`}
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
                <TableHead>Alasan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
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
                    Tidak ada pengajuan yang menunggu approval
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
                    <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-success text-success-foreground hover:bg-success/90"
                        onClick={() => handleApprove(request.id)}
                        disabled={actionLoading === request.id}
                      >
                        {actionLoading === request.id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => handleReject(request.id)}
                        disabled={actionLoading === request.id}
                      >
                        {actionLoading === request.id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-1" />
                        )}
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApprovalTab;
