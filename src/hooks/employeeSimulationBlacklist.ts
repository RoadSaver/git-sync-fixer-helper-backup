// employeeSimulationBlacklist.ts
// List of blacklisted simulated employees (for demo/testing purposes)

import { supabase } from '@/integrations/supabase/client';

export const employeeSimulationBlacklist = [
  // Add full_name or employee_number of simulated employees to blacklist them from assignment
  // Example:
  // "Ivan Ivanov",
  // 12,
];

/**
 * Fetches the list of blacklisted simulated employees from the Supabase employee_simulation table.
 * You can filter by any field (e.g., full_name, employee_number) as needed.
 */
export async function fetchBlacklistedSimulatedEmployees(): Promise<any[]> {
  // Example: fetch all employees whose full_name or employee_number is in the blacklist
  const { data, error } = await supabase
    .from('employee_simulation')
    .select('*')
    .in('full_name', employeeSimulationBlacklist);

  if (error) {
    console.error('Error fetching blacklisted simulated employees:', error);
    return [];
  }
  return data || [];
}
