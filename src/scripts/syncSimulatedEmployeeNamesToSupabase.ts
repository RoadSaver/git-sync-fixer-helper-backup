// Script: syncSimulatedEmployeeNamesToSupabase.ts
// Usage: Run with ts-node or compile and run with node
// This script reads names from employee-simulation-names.txt and upserts them into the Supabase employee_simulation table.

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// TODO: Set your Supabase project URL and service role key here
const SUPABASE_URL = process.env.SUPABASE_URL || '<YOUR_SUPABASE_URL>';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '<YOUR_SERVICE_ROLE_KEY>';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const NAMES_FILE = path.join(__dirname, '../simulated-employee-names/employee-simulation-names.txt');

async function main() {
  const file = fs.readFileSync(NAMES_FILE, 'utf-8');
  const lines = file.split(/\r?\n/).filter(Boolean);
  const employees = lines.map(line => {
    // Format: 1.Name Surname
    const match = line.match(/^(\d+)\.(.+)$/);
    if (!match) return null;
    const employee_number = parseInt(match[1], 10);
    const full_name = match[2].trim();
    return { employee_number, full_name };
  }).filter(Boolean);

  for (const emp of employees) {
    // Upsert by employee_number
    const { error } = await supabase
      .from('employee_simulation')
      .upsert({
        employee_number: emp.employee_number,
        full_name: emp.full_name
      }, { onConflict: 'employee_number' });
    if (error) {
      console.error(`Failed to upsert ${emp.full_name}:`, error.message);
    } else {
      console.log(`Upserted: ${emp.full_name}`);
    }
  }
  console.log('Sync complete.');
}

main().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
