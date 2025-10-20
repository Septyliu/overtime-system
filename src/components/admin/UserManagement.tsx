import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { User, Plus, Edit, Trash2, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { UserService } from '@/services/userService';
import { OvertimeService } from '@/services/overtimeService';

interface UserManagementProps {
  onDataRefresh?: () => void;
}

interface UserWithDetails extends User {
  id?: string;
  email?: string;
  pickup_point?: string;
  created_at?: string;
}

const UserManagement = ({ onDataRefresh }: UserManagementProps) => {
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithDetails | null>(null);

  const [newUser, setNewUser] = useState({
    nik: '',
    name: '',
    email: '',
    password: '',
    pickup_point: '',
    role: 'employee' as 'employee' | 'approver1' | 'approver2' | 'admin',
    approver1_nik: 'none',
    approver2_nik: 'none',
  });

  // Load all users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const allUsers = await UserService.getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error('Error loading users:', error);
        toast.error('Gagal memuat data user');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [onDataRefresh]);

  const handleAddUser = async () => {
    if (!newUser.nik || !newUser.name || !newUser.email || !newUser.password) {
      toast.error('Mohon lengkapi semua field yang wajib');
      return;
    }

    // For approver1 role, Approver 2 is required and Approver 1 must be none
    if (newUser.role === 'approver1') {
      if (!newUser.approver2_nik || newUser.approver2_nik === 'none') {
        toast.error('Approver 2 wajib diisi untuk role Approver 1');
        return;
      }
      // Ensure approver1_nik is not set for approver1 role
      newUser.approver1_nik = 'none';
    }

    setActionLoading('add');
    try {
      const userData = {
        ...newUser,
        approver1_nik: newUser.approver1_nik === 'none' ? undefined : newUser.approver1_nik,
        approver2_nik: newUser.approver2_nik === 'none' ? undefined : newUser.approver2_nik,
      };
      await UserService.createUser(userData);
      toast.success('User berhasil ditambahkan');
      setIsAddDialogOpen(false);
      setNewUser({
        nik: '',
        name: '',
        email: '',
        password: '',
        pickup_point: '',
        role: 'employee',
        approver1_nik: 'none',
        approver2_nik: 'none',
      });
      // Reload users
      const allUsers = await UserService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal menambahkan user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    setActionLoading(editingUser.nik);
    try {
      // Update profile
      if (editingUser.id) {
        await UserService.updateUserProfile(editingUser.id, {
          name: editingUser.name,
          pickup_point: editingUser.pickup_point,
        });

        // Update role
        await UserService.updateUserRole(
          editingUser.id,
          editingUser.role,
          editingUser.approver1 === 'none' ? null : editingUser.approver1,
          editingUser.approver2 === 'none' ? null : editingUser.approver2
        );
      }

      toast.success('User berhasil diupdate');
      setIsEditDialogOpen(false);
      setEditingUser(null);
      // Reload users
      const allUsers = await UserService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal mengupdate user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userNik: string) => {
    setActionLoading(userNik);
    try {
      // Find user ID
      const user = users.find(u => u.nik === userNik);
      if (!user?.id) {
        toast.error('User tidak ditemukan');
        return;
      }

      await UserService.deleteUser(user.id);
      toast.success('User berhasil dihapus');
      // Reload users
      const allUsers = await UserService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus user');
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      employee: 'bg-blue-100 text-blue-800',
      approver1: 'bg-yellow-100 text-yellow-800',
      approver2: 'bg-orange-100 text-orange-800',
      admin: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {role.toUpperCase()}
      </Badge>
    );
  };

  const getAvailableApprovers = (currentRole: string, currentNik: string) => {
    return users.filter(user => {
      // Don't include the current user
      if (user.nik === currentNik) return false;
      
      // For employee role, can have approver1 or approver2 or admin as approvers
      if (currentRole === 'employee') {
        return user.role === 'approver1' || user.role === 'approver2' || user.role === 'admin';
      }
      
      // For approver1 role, they must only have approver2 as their superior
      if (currentRole === 'approver1') {
        return user.role === 'approver2';
      }
      
      // For approver2 role, can have admin as approver
      if (currentRole === 'approver2') {
        return user.role === 'admin';
      }
      
      // For admin role, no approvers needed
      return false;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            User Management
          </h2>
          <p className="text-muted-foreground">Kelola data karyawan dan role approval</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tambah User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah User Baru</DialogTitle>
              <DialogDescription>
                Tambahkan user baru ke sistem overtime management
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nik">NIK *</Label>
                  <Input
                    id="nik"
                    value={newUser.nik}
                    onChange={(e) => setNewUser({ ...newUser, nik: e.target.value })}
                    placeholder="Masukkan NIK"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama *</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Masukkan nama"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Masukkan email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Masukkan password"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickup_point">Pickup Point</Label>
                <Input
                  id="pickup_point"
                  value={newUser.pickup_point}
                  onChange={(e) => setNewUser({ ...newUser, pickup_point: e.target.value })}
                  placeholder="Masukkan pickup point"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="approver1">Approver 1</SelectItem>
                    <SelectItem value="approver2">Approver 2</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Approver fields based on role */}
              {newUser.role === 'employee' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="approver1">Approver 1</Label>
                    <Select value={newUser.approver1_nik || 'none'} onValueChange={(value) => setNewUser({ ...newUser, approver1_nik: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Approver 1" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tidak ada</SelectItem>
                        {getAvailableApprovers(newUser.role, newUser.nik).map((user) => (
                          <SelectItem key={user.nik} value={user.nik}>
                            {user.name} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="approver2">Approver 2</Label>
                    <Select value={newUser.approver2_nik || 'none'} onValueChange={(value) => setNewUser({ ...newUser, approver2_nik: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Approver 2" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tidak ada</SelectItem>
                        {getAvailableApprovers(newUser.role, newUser.nik).map((user) => (
                          <SelectItem key={user.nik} value={user.nik}>
                            {user.name} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {newUser.role === 'approver1' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="approver2">Approver 2 (Wajib)</Label>
                    <Select value={newUser.approver2_nik || 'none'} onValueChange={(value) => setNewUser({ ...newUser, approver2_nik: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Approver 2" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tidak ada</SelectItem>
                        {getAvailableApprovers(newUser.role, newUser.nik).map((user) => (
                          <SelectItem key={user.nik} value={user.nik}>
                            {user.name} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {newUser.role === 'approver2' && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Approver 2 tidak memerlukan atasan di sistem.
                  </p>
                </div>
              )}
              {newUser.role === 'admin' && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Admin tidak memerlukan approver. Admin memiliki akses penuh ke semua fitur sistem.
                  </p>
                </div>
              )}
              
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleAddUser} disabled={actionLoading === 'add'}>
                  {actionLoading === 'add' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar User</CardTitle>
          <CardDescription>
            {loading ? 'Memuat data...' : `${users.length} user terdaftar`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIK</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Approver 1</TableHead>
                  <TableHead>Approver 2</TableHead>
                  <TableHead>Pickup Point</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Memuat data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Belum ada user terdaftar
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.nik}>
                      <TableCell className="font-medium">{user.nik}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email || '-'}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{user.approver1 || '-'}</TableCell>
                      <TableCell>{user.approver2 || '-'}</TableCell>
                      <TableCell>{user.pickup_point || '-'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingUser(user);
                            setIsEditDialogOpen(true);
                          }}
                          disabled={actionLoading === user.nik}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              disabled={actionLoading === user.nik}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus user {user.name} ({user.nik})?
                                Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.nik)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Edit informasi user {editingUser?.name}
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nik">NIK</Label>
                  <Input
                    id="edit-nik"
                    value={editingUser.nik}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nama</Label>
                  <Input
                    id="edit-name"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-pickup_point">Pickup Point</Label>
                <Input
                  id="edit-pickup_point"
                  value={editingUser.pickup_point || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, pickup_point: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select value={editingUser.role} onValueChange={(value: any) => setEditingUser({ ...editingUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="approver1">Approver 1</SelectItem>
                    <SelectItem value="approver2">Approver 2</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Approver fields - show for all roles except admin */}
              {editingUser.role !== 'admin' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-approver1">Approver 1</Label>
                    <Select value={editingUser.approver1 || 'none'} onValueChange={(value) => setEditingUser({ ...editingUser, approver1: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Approver 1" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tidak ada</SelectItem>
                        {getAvailableApprovers(editingUser.role, editingUser.nik).map((user) => (
                          <SelectItem key={user.nik} value={user.nik}>
                            {user.name} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-approver2">Approver 2</Label>
                    <Select value={editingUser.approver2 || 'none'} onValueChange={(value) => setEditingUser({ ...editingUser, approver2: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Approver 2" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tidak ada</SelectItem>
                        {getAvailableApprovers(editingUser.role, editingUser.nik).map((user) => (
                          <SelectItem key={user.nik} value={user.nik}>
                            {user.name} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              {/* Show approver info for admin role */}
              {editingUser.role === 'admin' && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Admin tidak memerlukan approver. Admin memiliki akses penuh ke semua fitur sistem.
                  </p>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleEditUser} disabled={actionLoading === editingUser.nik}>
                  {actionLoading === editingUser.nik ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
