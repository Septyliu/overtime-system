import { useState } from 'react';
import { User } from '@/types/overtime';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, User as UserIcon } from 'lucide-react';
import OvertimeForm from './OvertimeForm';
import ApprovalTab from './ApprovalTab';
import MonitoringTab from './MonitoringTab';
import ReportTab from './ReportTab';
import UserManagement from '../admin/UserManagement';
import ApprovalManagement from '../admin/ApprovalManagement';

interface MainAppProps {
  currentUser: User;
  onLogout: () => void;
}

const MainApp = ({ 
  currentUser, 
  onLogout
}: MainAppProps) => {
  const [activeTab, setActiveTab] = useState('submit');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'employee':
        return 'Karyawan';
      case 'approver1':
        return 'Approver Level 1';
      case 'approver2':
        return 'Approver Level 2';
      case 'admin':
        return 'Administrator';
      default:
        return role;
    }
  };

  const canAccessTab = (tab: string) => {
    switch (tab) {
      case 'submit':
        return currentUser.role === 'approver1';
      case 'approval':
        return ['approver1', 'approver2', 'admin'].includes(currentUser.role);
      case 'monitoring':
      case 'report':
        return true;
      case 'user-management':
      case 'approval-management':
        return currentUser.role === 'admin';
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="shadow-lg-custom bg-gradient-to-r from-primary to-accent text-white">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Selamat Datang, {currentUser.name}</h2>
                  <p className="text-white/90 text-sm">
                    NIK: {currentUser.nik} | {getRoleName(currentUser.role)}
                  </p>
                </div>
              </div>
              <Button 
                onClick={onLogout} 
                variant="outline" 
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card shadow-card p-1 grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-1">
            {canAccessTab('submit') && (
              <TabsTrigger value="submit">Submit Overtime</TabsTrigger>
            )}
            {canAccessTab('approval') && (
              <TabsTrigger value="approval">Approval</TabsTrigger>
            )}
            {canAccessTab('monitoring') && (
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            )}
            {canAccessTab('report') && (
              <TabsTrigger value="report">Report</TabsTrigger>
            )}
            {canAccessTab('user-management') && (
              <TabsTrigger value="user-management">Manage Users</TabsTrigger>
            )}
            {canAccessTab('approval-management') && (
              <TabsTrigger value="approval-management">Manage Approval</TabsTrigger>
            )}
          </TabsList>

          {canAccessTab('submit') && (
            <TabsContent value="submit">
              <OvertimeForm
                currentUser={currentUser}
                onRequestSubmitted={handleDataRefresh}
              />
            </TabsContent>
          )}

          {canAccessTab('approval') && (
            <TabsContent value="approval">
              <ApprovalTab
                currentUser={currentUser}
                onRequestUpdated={handleDataRefresh}
              />
            </TabsContent>
          )}

          {canAccessTab('monitoring') && (
            <TabsContent value="monitoring">
              <MonitoringTab currentUser={currentUser} onDataRefresh={refreshKey} />
            </TabsContent>
          )}

          {canAccessTab('report') && (
            <TabsContent value="report">
              <ReportTab currentUser={currentUser} onDataRefresh={refreshKey} />
            </TabsContent>
          )}

          {canAccessTab('user-management') && (
            <TabsContent value="user-management">
              <UserManagement onDataRefresh={refreshKey} />
            </TabsContent>
          )}

          {canAccessTab('approval-management') && (
            <TabsContent value="approval-management">
              <ApprovalManagement onDataRefresh={refreshKey} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default MainApp;
