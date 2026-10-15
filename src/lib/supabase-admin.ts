import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../types/database";

export const STORAGE_BUCKET = "media";
export const STORAGE_FOLDER = "drive";

export function getSupabaseAdminClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "Supabase URL or Key is missing. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.",
    );
  }

  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getStorageFilePublicUrl(fileName: string): string {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${STORAGE_FOLDER}/${encodeURIComponent(fileName)}`;
}
