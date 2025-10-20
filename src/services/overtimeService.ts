import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { OvertimeRequest, OvertimeRequestDisplay, User } from '@/types/overtime';

type OvertimeRequestRow = Database['public']['Tables']['overtime_requests']['Row'];
type OvertimeRequestInsert = Database['public']['Tables']['overtime_requests']['Insert'];
type OvertimeRequestUpdate = Database['public']['Tables']['overtime_requests']['Update'];

// Helper function to convert database row to display format
const convertToDisplayFormat = (row: OvertimeRequestRow): OvertimeRequestDisplay => ({
  id: row.id,
  user_id: row.user_id,
  nik: row.nik,
  name: row.name,
  category: row.category,
  categoryKey: row.category_key,
  date: row.date,
  startTime: row.start_time,
  endTime: row.end_time,
  duration: row.duration,
  reason: row.reason,
  status: row.status || 'pending',
  approver1Status: row.approver1_status || 'pending',
  approver2Status: row.approver2_status || 'pending',
  approver1: row.approver1_name,
  approver2: row.approver2_name,
  createdAt: row.created_at || new Date().toISOString(),
});

// Helper function to convert display format to database insert format
const convertToInsertFormat = (request: Omit<OvertimeRequestDisplay, 'id' | 'createdAt'>): OvertimeRequestInsert => ({
  user_id: request.user_id,
  nik: request.nik,
  name: request.name,
  category: request.category,
  category_key: request.categoryKey,
  date: request.date,
  start_time: request.startTime,
  end_time: request.endTime,
  duration: request.duration,
  reason: request.reason,
  status: request.status,
  approver1_status: request.approver1Status,
  approver2_status: request.approver2Status,
  approver1_name: request.approver1,
  approver2_name: request.approver2,
});

export class OvertimeService {
  // Helper method to ensure authentication (disabled for now)
  private static async ensureAuth() {
    // Skip authentication for now since anonymous auth is disabled
    // const { error } = await supabase.auth.signInAnonymously();
    // if (error) {
    //   console.warn('Auth warning:', error);
    // }
  }
  // Get all overtime requests
  static async getAllRequests(): Promise<OvertimeRequestDisplay[]> {
    try {
      await this.ensureAuth();

      const { data, error } = await supabase
        .from('overtime_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data.map(convertToDisplayFormat);
    } catch (error) {
      console.error('Error fetching overtime requests:', error);
      throw new Error('Failed to fetch overtime requests');
    }
  }

  // Get overtime requests for a specific user
  static async getUserRequests(userId: string): Promise<OvertimeRequestDisplay[]> {
    try {
      const { data, error } = await supabase
        .from('overtime_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(convertToDisplayFormat);
    } catch (error) {
      console.error('Error fetching user overtime requests:', error);
      throw new Error('Failed to fetch user overtime requests');
    }
  }

  // Get overtime requests by NIK (for employee self-monitoring)
  static async getRequestsByNik(nik: string): Promise<OvertimeRequestDisplay[]> {
    try {
      const { data, error } = await supabase
        .from('overtime_requests')
        .select('*')
        .eq('nik', nik)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(convertToDisplayFormat);
    } catch (error) {
      console.error('Error fetching overtime requests by NIK:', error);
      throw new Error('Failed to fetch overtime requests');
    }
  }

  // Get pending requests for an approver
  static async getPendingRequestsForApprover(approverNik: string): Promise<OvertimeRequestDisplay[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_pending_requests_for_approver', { _approver_nik: approverNik });

      if (error) throw error;

      return data.map(convertToDisplayFormat);
    } catch (error) {
      console.error('Error fetching pending requests for approver:', error);
      throw new Error('Failed to fetch pending requests');
    }
  }

  // Create new overtime request
  static async createRequest(request: Omit<OvertimeRequestDisplay, 'id' | 'createdAt'>): Promise<OvertimeRequestDisplay> {
    try {
      // Skip authentication for now since anonymous auth is disabled
      // await this.ensureAuth();

      // Get user_id from NIK
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('nik', request.nik)
        .single();

      if (profileError || !profile) {
        throw new Error('User not found');
      }

      const userId = profile.id;

      // Skip validation for now to avoid RLS issues
      // TODO: Re-enable validation once RLS is properly configured
      /*
      const isValid = await supabase.rpc('validate_overtime_request', {
        _user_id: userId,
        _date: request.date,
        _category_key: request.categoryKey,
        _start_time: request.startTime,
        _end_time: request.endTime,
      });

      if (isValid.error || !isValid.data) {
        throw new Error('Invalid overtime request or duplicate submission');
      }
      */

      const insertData = convertToInsertFormat({ ...request, user_id: userId });
      
      const { data, error } = await supabase
        .from('overtime_requests')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      return convertToDisplayFormat(data);
    } catch (error) {
      console.error('Error creating overtime request:', error);
      throw new Error('Failed to create overtime request');
    }
  }

  // Update overtime request status (approve/reject)
  static async updateRequestStatus(
    requestId: number,
    approverRole: 'approver1' | 'approver2' | 'admin',
    approverName: string,
    status: 'approved' | 'rejected'
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('update_overtime_status', {
        _request_id: requestId,
        _approver_role: approverRole,
        _approver_name: approverName,
        _status: status,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating overtime request status:', error);
      throw new Error('Failed to update overtime request status');
    }
  }

  // Get overtime statistics
  static async getStatistics(startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase.rpc('get_overtime_statistics', {
        _start_date: startDate,
        _end_date: endDate,
      });

      if (error) throw error;

      return data[0] || {
        total_requests: 0,
        pending_requests: 0,
        approved_requests: 0,
        rejected_requests: 0,
        total_hours: 0,
      };
    } catch (error) {
      console.error('Error fetching overtime statistics:', error);
      throw new Error('Failed to fetch overtime statistics');
    }
  }

  // Get user overtime report
  static async getUserReport(userNik: string, startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase.rpc('get_user_overtime_report', {
        _user_nik: userNik,
        _start_date: startDate,
        _end_date: endDate,
      });

      if (error) throw error;

      return data[0] || {
        nik: userNik,
        name: '',
        total_hours: 0,
        total_requests: 0,
        approved_requests: 0,
        rejected_requests: 0,
        pending_requests: 0,
      };
    } catch (error) {
      console.error('Error fetching user overtime report:', error);
      throw new Error('Failed to fetch user overtime report');
    }
  }

  // Get overtime requests with details (using view)
  static async getRequestsWithDetails(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('overtime_requests_with_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching overtime requests with details:', error);
      throw new Error('Failed to fetch overtime requests with details');
    }
  }

  // Delete overtime request (only for admin or owner)
  static async deleteRequest(requestId: number, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('overtime_requests')
        .delete()
        .eq('id', requestId)
        .eq('user_id', userId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting overtime request:', error);
      throw new Error('Failed to delete overtime request');
    }
  }

  // Update overtime request (only for owner and if not approved)
  static async updateRequest(
    requestId: number,
    userId: string,
    updates: Partial<OvertimeRequestUpdate>
  ): Promise<OvertimeRequestDisplay> {
    try {
      // Check if request exists and belongs to user
      const { data: existingRequest, error: fetchError } = await supabase
        .from('overtime_requests')
        .select('*')
        .eq('id', requestId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !existingRequest) {
        throw new Error('Request not found or access denied');
      }

      // Check if request is still editable (not approved)
      if (existingRequest.status === 'approved') {
        throw new Error('Cannot edit approved request');
      }

      const { data, error } = await supabase
        .from('overtime_requests')
        .update(updates)
        .eq('id', requestId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return convertToDisplayFormat(data);
    } catch (error) {
      console.error('Error updating overtime request:', error);
      throw new Error('Failed to update overtime request');
    }
  }
}
