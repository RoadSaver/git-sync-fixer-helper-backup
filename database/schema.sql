-- Create the price_quote_snapshots table
CREATE TABLE IF NOT EXISTS price_quote_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  employee_id TEXT,
  service_type TEXT NOT NULL,
  price_quote DECIMAL(10,2) NOT NULL,
  service_fee DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  employee_name TEXT NOT NULL,
  snapshot_data JSONB NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'finished')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the user_finished_requests table
CREATE TABLE IF NOT EXISTS user_finished_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  request_id TEXT NOT NULL,
  snapshot_id UUID REFERENCES price_quote_snapshots(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the employee_finished_requests table
CREATE TABLE IF NOT EXISTS employee_finished_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_username TEXT NOT NULL,
  request_id TEXT NOT NULL,
  snapshot_id UUID REFERENCES price_quote_snapshots(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supabase local copy schema for RoadSaver app

-- user_history table
CREATE TABLE IF NOT EXISTS user_history (
  id SERIAL PRIMARY KEY,
  request_id TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  accepted_price DECIMAL NOT NULL,
  employee_name TEXT NOT NULL,
  location TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL
);

-- simulated_employee_history table
CREATE TABLE IF NOT EXISTS simulated_employee_history (
  id SERIAL PRIMARY KEY,
  request_id TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  accepted_price DECIMAL NOT NULL,
  user_name TEXT NOT NULL,
  location TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL
);

-- employee_simulation table (for available employees)
CREATE TABLE IF NOT EXISTS employee_simulation (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  location_lat DECIMAL,
  location_lng DECIMAL
);

-- users table (for user info)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_price_quote_snapshots_request_id ON price_quote_snapshots(request_id);
CREATE INDEX IF NOT EXISTS idx_price_quote_snapshots_user_id ON price_quote_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_price_quote_snapshots_status ON price_quote_snapshots(status);
CREATE INDEX IF NOT EXISTS idx_user_finished_requests_user_id ON user_finished_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_finished_requests_employee_id ON employee_finished_requests(employee_id);

-- Enable Row Level Security
ALTER TABLE price_quote_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_finished_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_finished_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (you may need to adjust these based on your authentication setup)
CREATE POLICY "Users can view their own snapshots" ON price_quote_snapshots
  FOR SELECT USING (user_id = auth.uid()::text OR employee_id = auth.uid()::text);

CREATE POLICY "Users can insert their own snapshots" ON price_quote_snapshots
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can view their finished requests" ON user_finished_requests
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Employees can view their finished requests" ON employee_finished_requests
  FOR SELECT USING (employee_id = auth.uid()::text);
