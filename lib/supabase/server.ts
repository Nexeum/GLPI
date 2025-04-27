import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// Ensure we're using environment variables correctly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables")
}

// Create a singleton instance for the server
export const supabaseServer = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
})

// Function to get authenticated client with cookies
export const getAuthenticatedSupabaseClient = () => {
  const cookieStore = cookies()

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      cookieOptions: {
        name: "sb-session",
      },
    },
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
    },
  })
}
