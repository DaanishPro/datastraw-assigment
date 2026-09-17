import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client singleton.
 * Uses SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from environment variables.
 * 
 * IMPORTANT: This client must only be used in server-side Next.js Route Handlers
 * or Server Components. Never import or use this on the client side.
 */

// Clean up SUPABASE_URL to prevent issues if someone includes '/rest/v1/' or trailing slashes
function getCleanSupabaseUrl(): string {
  const rawUrl = process.env.SUPABASE_URL || "";
  return rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

const supabaseUrl = getCleanSupabaseUrl();
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // Warn on server start if environment variables are not loaded properly
  console.warn(
    "[Supabase Client] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
  );
}

// Reusable server client with service-role permissions for direct database queries
export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
