import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { User } from '@/types/overtime';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type UserRoleRow = Database['public']['Tables']['user_roles']['Row'];
type UserRoleInsert = Database['public']['Tables']['user_roles']['Insert'];

export class UserService {
  // Helper method to ensure authentication
  private static async ensureAuth() {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.warn('Auth warning:', error);
    }
  }
  // Get user by NIK
  static async getUserByNik(nik: string): Promise<User | null> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('nik', nik.trim())
        .single();

      if (profileError || !profile) {
        return null;
      }

      // Get user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, approver1_nik, approver2_nik')
        .eq('user_id', profile.id)
        .single();

      if (roleError) {
        console.error('Error fetching user role:', roleError);
        // Return user with default employee role
        return {
          nik: profile.nik,
          name: profile.name,
          role: 'employee',
        };
      }

      return {
        nik: profile.nik,
        name: profile.name,
        role: roleData.role,
        approver1: roleData.approver1_nik || undefined,
        approver2: roleData.approver2_nik || undefined,
      };
    } catch (error) {
      console.error('Error fetching user by NIK:', error);
      return null;
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        return null;
      }

      // Get user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, approver1_nik, approver2_nik')
        .eq('user_id', profile.id)
        .single();

      if (roleError) {
        console.error('Error fetching user role:', roleError);
        return {
          nik: profile.nik,
          name: profile.name,
          role: 'employee',
        };
      }

      return {
        nik: profile.nik,
        name: profile.name,
        role: roleData.role,
        approver1: roleData.approver1_nik || undefined,
        approver2: roleData.approver2_nik || undefined,
      };
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  }

  // Get all users
  static async getAllUsers(): Promise<User[]> {
    try {
      // Skip authentication for now since anonymous auth is disabled
      // await this.ensureAuth();

      // Get profiles first
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (profilesError) {
        console.error('Profiles error:', profilesError);
        throw new Error(`Database error: ${profilesError.message}`);
      }

      if (!profiles || profiles.length === 0) {
        return [];
      }

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) {
        console.error('User roles error:', rolesError);
        throw new Error(`Database error: ${rolesError.message}`);
      }

      // Combine profiles with their roles
      return profiles.map(profile => {
        const userRole = userRoles?.find(role => role.user_id === profile.id);
        return {
          nik: profile.nik,
          name: profile.name,
          role: userRole?.role || 'employee',
          approver1: userRole?.approver1_nik || undefined,
          approver2: userRole?.approver2_nik || undefined,
        };
      });
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  // Get users by role
  static async getUsersByRole(role: 'employee' | 'approver1' | 'approver2' | 'admin'): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          role,
          approver1_nik,
          approver2_nik,
          profiles (
            nik,
            name
          )
        `)
        .eq('role', role);

      if (error) throw error;

      return data.map(userRole => ({
        nik: userRole.profiles.nik,
        name: userRole.profiles.name,
        role: userRole.role,
        approver1: userRole.approver1_nik || undefined,
        approver2: userRole.approver2_nik || undefined,
      }));
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw new Error('Failed to fetch users by role');
    }
  }

  // Create new user
  static async createUser(userData: {
    nik: string;
    name: string;
    email: string;
    password: string;
    pickup_point?: string;
    role: 'employee' | 'approver1' | 'approver2' | 'admin';
    approver1_nik?: string;
    approver2_nik?: string;
  }): Promise<User> {
    try {
      // Skip authentication for now since anonymous auth is disabled
      // await this.ensureAuth();

      // Check if NIK already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('nik')
        .eq('nik', userData.nik)
        .single();

      if (existingProfile) {
        throw new Error('NIK sudah digunakan');
      }

      // Generate unique user ID
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          nik: userData.nik,
          name: userData.name,
          pickup_point: userData.pickup_point,
        });

      if (profileError) {
        console.error('Profile error:', profileError);
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      // Create user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: userData.role,
          approver1_nik: userData.approver1_nik,
          approver2_nik: userData.approver2_nik,
        });

      if (roleError) {
        console.error('Role error:', roleError);
        throw new Error(`Failed to create user role: ${roleError.message}`);
      }

      return {
        nik: userData.nik,
        name: userData.name,
        role: userData.role,
        approver1: userData.approver1_nik,
        approver2: userData.approver2_nik,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user role
  static async updateUserRole(
    userId: string,
    role: 'employee' | 'approver1' | 'approver2' | 'admin',
    approver1_nik?: string | null,
    approver2_nik?: string | null
  ): Promise<boolean> {
    try {
      // Skip authentication for now since anonymous auth is disabled
      // await this.ensureAuth();

      const { error } = await supabase
        .from('user_roles')
        .update({
          role,
          approver1_nik,
          approver2_nik,
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error('Failed to update user role');
    }
  }

  // Update user profile
  static async updateUserProfile(
    userId: string,
    updates: {
      name?: string;
      pickup_point?: string;
    }
  ): Promise<boolean> {
    try {
      // Skip authentication for now since anonymous auth is disabled
      // await this.ensureAuth();

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  // Delete user
  static async deleteUser(userId: string): Promise<boolean> {
    try {
      // Skip authentication for now since anonymous auth is disabled
      // await this.ensureAuth();

      // Delete user role first
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (roleError) {
        console.error('Error deleting user role:', roleError);
      }

      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        throw new Error(`Failed to delete profile: ${profileError.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  // Get approvers for a user
  static async getUserApprovers(userNik: string): Promise<{
    approver1?: User;
    approver2?: User;
  }> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('approver1_nik, approver2_nik')
        .eq('profiles.nik', userNik)
        .single();

      if (error || !data) {
        return {};
      }

      const result: { approver1?: User; approver2?: User } = {};

      if (data.approver1_nik) {
        result.approver1 = await this.getUserByNik(data.approver1_nik);
      }

      if (data.approver2_nik) {
        result.approver2 = await this.getUserByNik(data.approver2_nik);
      }

      return result;
    } catch (error) {
      console.error('Error fetching user approvers:', error);
      return {};
    }
  }

  // Check if user has specific role
  static async hasRole(userId: string, role: 'employee' | 'approver1' | 'approver2' | 'admin'): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _role: role,
        _user_id: userId,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  }

  // Get user role
  static async getUserRole(userId: string): Promise<'employee' | 'approver1' | 'approver2' | 'admin' | null> {
    try {
      const { data, error } = await supabase.rpc('get_user_role', {
        _user_id: userId,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }
}
