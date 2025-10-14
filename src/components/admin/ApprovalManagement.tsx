import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock, Loader2, Filter, Search, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { OvertimeRequestDisplay } from '@/types/overtime';
import { OvertimeService } from '@/services/overtimeService';

interface ApprovalManagementProps {
  onDataRefresh?: () => void;
}

const ApprovalManagement = ({ onDataRefresh }: ApprovalManagementProps) => {
  const [requests, setRequests] = useState<OvertimeRequestDisplay[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<OvertimeRequestDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Load all overtime requests
  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        const allRequests = await OvertimeService.getAllRequests();
        setRequests(allRequests);
        setFilteredRequests(allRequests);
      } catch (error) {
        console.error('Error loading overtime requests:', error);
        toast.error('Gagal memuat data pengajuan');
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [onDataRefresh]);

  // Apply filters
  useEffect(() => {
    let filtered = requests;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.nik.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(req => req.date === dateFilter);
    }

    setFilteredRequests(filtered);
  }, [requests, statusFilter, searchTerm, dateFilter]);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      const success = await OvertimeService.updateRequestStatus(
        id,
        'admin',
        'Admin',
        'approved'
      );

      if (success) {
        toast.success('Overtime berhasil di-approve');
        // Reload requests
        const allRequests = await OvertimeService.getAllRequests();
        setRequests(allRequests);
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
        'admin',
        'Admin',
        'rejected'
      );

      if (success) {
        toast.error('Overtime ditolak');
        // Reload requests
        const allRequests = await OvertimeService.getAllRequests();
        setRequests(allRequests);
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

  const getApprovalStatusBadge = (status: string) => {
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

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchTerm('');
    setDateFilter('');
  };

  const getStats = () => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;
    
    return { total, pending, approved, rejected };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Approval Management
        </h2>
        <p className="text-muted-foreground">Kelola semua pengajuan overtime sebagai admin</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pengajuan</p>
                <p className="text-3xl font-bold text-primary">{stats.total}</p>
              </div>
              <Clock className="w-10 h-10 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
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

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disetujui</p>
                <p className="text-3xl font-bold text-success">{stats.approved}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-success opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ditolak</p>
                <p className="text-3xl font-bold text-destructive">{stats.rejected}</p>
              </div>
              <XCircle className="w-10 h-10 text-destructive opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Cari NIK, nama, atau kategori..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-filter">Tanggal</Label>
              <Input
                id="date-filter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengajuan Overtime</CardTitle>
          <CardDescription>
            {loading ? 'Memuat data...' : `${filteredRequests.length} dari ${requests.length} pengajuan`}
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
                  <TableHead>Approver 1</TableHead>
                  <TableHead>Approver 2</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Memuat data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      {requests.length === 0 ? 'Belum ada pengajuan overtime' : 'Tidak ada pengajuan yang sesuai dengan filter'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.nik}</TableCell>
                      <TableCell>{request.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{request.category}</TableCell>
                      <TableCell>{new Date(request.date).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="whitespace-nowrap">{request.startTime} - {request.endTime}</TableCell>
                      <TableCell>{request.duration} jam</TableCell>
                      <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{request.approver1 || '-'}</div>
                          {getApprovalStatusBadge(request.approver1Status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{request.approver2 || '-'}</div>
                          {getApprovalStatusBadge(request.approver2Status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {request.status === 'pending' && (
                          <>
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
                          </>
                        )}
                        {request.status !== 'pending' && (
                          <span className="text-sm text-muted-foreground">
                            {request.status === 'approved' ? 'Sudah disetujui' : 'Sudah ditolak'}
                          </span>
                        )}
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

export default ApprovalManagement;
