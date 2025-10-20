import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileBarChart, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { OvertimeService } from '@/services/overtimeService';

interface ReportTabProps {
  onDataRefresh?: () => void;
}

interface ReportData {
  nik: string;
  name: string;
  total_hours: number;
  total_requests: number;
  approved_requests: number;
  rejected_requests: number;
  pending_requests: number;
}

const ReportTab = ({ onDataRefresh }: ReportTabProps) => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generateReport = async () => {
    if (!selectedMonth) {
      toast.error('Pilih bulan terlebih dahulu');
      return;
    }

    setGenerating(true);
    try {
      // Get start and end date for the selected month
      const startDate = `${selectedMonth}-01`;
      const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0)
        .toISOString().split('T')[0];

      // Get all requests for the month
      const allRequests = await OvertimeService.getAllRequests();
      const monthRequests = allRequests.filter(item => 
        item.date >= startDate && item.date <= endDate
      );

      // Group by user
      const data: Record<string, ReportData> = {};

      monthRequests.forEach(item => {
        if (!data[item.nik]) {
          data[item.nik] = {
            nik: item.nik,
            name: item.name,
            total_hours: 0,
            total_requests: 0,
            approved_requests: 0,
            rejected_requests: 0,
            pending_requests: 0,
          };
        }

        data[item.nik].total_requests++;
        
        if (item.status === 'approved') {
          data[item.nik].total_hours += item.duration;
          data[item.nik].approved_requests++;
        } else if (item.status === 'rejected') {
          data[item.nik].rejected_requests++;
        } else if (item.status === 'pending') {
          data[item.nik].pending_requests++;
        }
      });

      setReportData(Object.values(data));
      toast.success('Report berhasil di-generate');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Gagal generate report');
    } finally {
      setGenerating(false);
    }
  };

  const exportToCSV = () => {
    if (reportData.length === 0) {
      toast.error('Generate report terlebih dahulu');
      return;
    }

    // Determine date range text for the selected month
    const startDate = `${selectedMonth}-01`;
    const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0)
      .toISOString().split('T')[0];
    const periode = `${startDate} s/d ${endDate}`;

    const headers = ['Tanggal', 'NIK', 'Nama', 'Total Jam Lembur', 'Total Pengajuan', 'Disetujui', 'Ditolak', 'Pending'];
    const rows = reportData.map(row => [
      periode,
      row.nik,
      row.name,
      row.total_hours.toFixed(2),
      row.total_requests,
      row.approved_requests,
      row.rejected_requests,
      row.pending_requests,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `overtime_report_${selectedMonth}.csv`;
    link.click();

    toast.success('Report berhasil di-export');
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileBarChart className="w-5 h-5" />
          Report Overtime
        </CardTitle>
        <CardDescription>
          Generate laporan overtime berdasarkan bulan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="reportMonth">Filter Bulan</Label>
            <Input
              id="reportMonth"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
          <div className="flex gap-2 items-end">
            <Button onClick={generateReport} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
            {reportData.length > 0 && (
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIK</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead className="text-right">Total Jam Lembur</TableHead>
                <TableHead className="text-right">Total Pengajuan</TableHead>
                <TableHead className="text-right">Disetujui</TableHead>
                <TableHead className="text-right">Ditolak</TableHead>
                <TableHead className="text-right">Pending</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {selectedMonth 
                      ? 'Klik "Generate Report" untuk melihat data'
                      : 'Pilih bulan dan klik "Generate Report"'}
                  </TableCell>
                </TableRow>
              ) : (
                reportData.map((row) => (
                  <TableRow key={row.nik}>
                    <TableCell className="font-medium">{row.nik}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {row.total_hours.toFixed(2)} jam
                    </TableCell>
                    <TableCell className="text-right">{row.total_requests}</TableCell>
                    <TableCell className="text-right text-success">{row.approved_requests}</TableCell>
                    <TableCell className="text-right text-destructive">{row.rejected_requests}</TableCell>
                    <TableCell className="text-right text-warning">{row.pending_requests}</TableCell>
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

export default ReportTab;
