// Script to sync names from employee-simulation-names.txt to Supabase employee_simulation table
// Usage: node sync-simulated-employees-to-supabase.js

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Set your Supabase credentials here or use environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const FILE_PATH = path.join(__dirname, '../simulated-employee-names/employee-simulation-names.txt');

async function main() {
  const file = fs.readFileSync(FILE_PATH, 'utf-8');
  const lines = file.split(/\r?\n/).filter(line => line.trim() && !line.startsWith('//'));
  const employees = lines.map(line => {
    // Format: 1.Name Surname
    const match = line.match(/^(\d+)\.(.+)$/);
    if (!match) return null;
    return {
      employee_number: parseInt(match[1], 10),
      full_name: match[2].trim(),
    };
  }).filter(Boolean);

  for (const emp of employees) {
    // Upsert by employee_number
    const { error } = await supabase
      .from('employee_simulation')
      .upsert({
        employee_number: emp.employee_number,
        full_name: emp.full_name
      }, { onConflict: ['employee_number'] });
    if (error) {
      console.error(`Failed to upsert ${emp.full_name}:`, error.message);
    } else {
      console.log(`Upserted: ${emp.full_name}`);
    }
  }
  console.log('Sync complete.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
