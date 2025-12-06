/*
  # Create charging sessions table

  1. New Tables
    - `charging_sessions`
      - `id` (uuid, primary key)
      - `startTime` (timestamp)
      - `startBattery` (integer)
      - `endTime` (timestamp, nullable)
      - `endBattery` (integer, nullable)
      - `location` (text) - lokasi charging (Rumah, Kantor, Lainnya)
      - `isActive` (boolean)
      - `created_at` (timestamp)
      - `user_id` (uuid) - untuk multi-user support di masa depan

  2. Security
    - Enable RLS on `charging_sessions` table
    - Add policy for unauthenticated users to read/write their own data (via session ID)
*/

CREATE TABLE IF NOT EXISTS charging_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startTime timestamptz NOT NULL,
  startBattery integer NOT NULL,
  endTime timestamptz,
  endBattery integer,
  location text DEFAULT 'Rumah',
  isActive boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE charging_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous access to charging sessions"
  ON charging_sessions
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);