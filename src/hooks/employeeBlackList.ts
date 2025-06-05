// employeeList.ts
// List of actual (real) employees in the system

import { supabase } from '@/integrations/supabase/client';

export interface Employee {
  id: string;
  username: string;
  email: string;
  phone_number?: string;
  employee_role?: string;
  status?: 'active' | 'inactive' | 'suspended';
  created_at: string;
}

// This list should be populated from the database in production.
// For demo/testing, you can add static entries here.
export const employeeList: Employee[] = [
  // Example:
  // {
  //   id: '1',
  //   username: 'real_employee',
  //   email: 'real@company.com',
  //   phone_number: '+359888123456',
  //   employee_role: 'technician',
  //   status: 'active',
  //   created_at: '2025-06-01T12:00:00Z',
  // },
];

/**
 * Fetches the list of actual employees from the Supabase employee_accounts table.
 * Returns an array of Employee objects.
 */
export async function fetchEmployeeList(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('employee_accounts')
    .select('*');

  if (error) {
    console.error('Error fetching employee list:', error);
    return [];
  }
  return data as Employee[];
}

// NOTE: This file is for real (non-simulated) employees only.
// Do NOT use this file for simulated employee assignment or blacklisting.
//
// Simulated employee assignment, blacklisting, and Accept/Decline logic are handled via:
//   - src/hooks/useEmployeeSimulation.ts (loads simulated employees from employee_simulation table)
//   - src/hooks/employeeSimulationBlacklist.ts (blacklist for simulated employees)
//   - src/components/service/hooks/useRequestSimulation.ts (simulated assignment/decline logic)
//
// If you need to update simulated employee logic, do so in those files, NOT here.
