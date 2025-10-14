export interface User {
  nik: string;
  name: string;
  role: 'employee' | 'approver1' | 'approver2' | 'admin';
  approver1?: string;
  approver2?: string;
}

export interface OvertimeRequest {
  id: number;
  user_id: string;
  nik: string;
  name: string;
  category: string;
  category_key: string;
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approver1_status: 'pending' | 'approved' | 'rejected';
  approver2_status: 'pending' | 'approved' | 'rejected';
  approver1_name: string | null;
  approver2_name: string | null;
  approver1_approved_at: string | null;
  approver2_approved_at: string | null;
  created_at: string;
  updated_at: string;
}

// Extended interface for display purposes
export interface OvertimeRequestDisplay extends Omit<OvertimeRequest, 'category_key' | 'start_time' | 'end_time' | 'approver1_status' | 'approver2_status' | 'approver1_name' | 'approver2_name' | 'approver1_approved_at' | 'approver2_approved_at' | 'created_at' | 'updated_at'> {
  categoryKey: string;
  startTime: string;
  endTime: string;
  approver1Status: 'pending' | 'approved' | 'rejected';
  approver2Status: 'pending' | 'approved' | 'rejected';
  approver1: string | null;
  approver2: string | null;
  createdAt: string;
}

export interface OvertimeCategory {
  name: string;
  startTime: string;
  endTime: string;
}

export const overtimeCategories: Record<string, OvertimeCategory> = {
  'shift1_weekday': {
    name: 'SHIFT 1 WEEKDAY',
    startTime: '16:40',
    endTime: '19:00'
  },
  'shift1_friday': {
    name: 'SHIFT 1 FRIDAY',
    startTime: '17:15',
    endTime: '19:05'
  },
  'shift2_weekday': {
    name: 'SHIFT 2 WEEKDAY',
    startTime: '04:30',
    endTime: '06:50'
  },
  'shift1_offday': {
    name: 'SHIFT 1 OFFDAY',
    startTime: '07:30',
    endTime: '16:40'
  },
  'shift1_offday_friday': {
    name: 'SHIFT 1 OFFDAY FRIDAY',
    startTime: '07:30',
    endTime: '17:15'
  },
  'shift2_offday': {
    name: 'SHIFT 2 OFFDAY',
    startTime: '19:30',
    endTime: '04:30'
  },
  'shift1_offday_longshift': {
    name: 'SHIFT 1 OFFDAY LONGSHIFT',
    startTime: '07:30',
    endTime: '19:00'
  },
  'shift2_offday_longshift': {
    name: 'SHIFT 2 OFFDAY LONGSHIFT',
    startTime: '19:30',
    endTime: '06:50'
  }
};
