/*
  # Add version check table

  1. New Tables
    - `app_version`
      - `id` (uuid, primary key)
      - `version` (text, unique)
      - `released_at` (timestamp)
      - `created_at` (timestamp)

  2. Notes
    - Store current app version to track updates
    - Allows users to know when new version is available
*/

CREATE TABLE IF NOT EXISTS app_version (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text UNIQUE NOT NULL,
  released_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

INSERT INTO app_version (version) VALUES ('2.62') ON CONFLICT DO NOTHING;
