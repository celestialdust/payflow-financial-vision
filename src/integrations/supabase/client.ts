// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qjvbmjhjrvlfshsnjonh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqdmJtamhqcnZsZnNoc25qb25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3ODY0MjEsImV4cCI6MjA2MTM2MjQyMX0.vcyj8nGFdwp3_71iBHv65FS_mqcsFEp7Ogx2W_6o21E";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);