import { createClient } from "@supabase/supabase-js"

// Ensure we're using environment variables correctly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if we have the required environment variables
if (!supabaseUrl || !supabaseKey) {
  console.warn("Missing Supabase environment variables. Using fallback values for development only.")
}

// Create a singleton instance for the server
export const supabaseServer = createClient(
  supabaseUrl || "https://zlreblmtakgsgqzyyqss.supabase.co",
  supabaseKey ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpscmVibG10YWtnc2dxenl5cXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MTE3MDAsImV4cCI6MjA2MTA4NzcwMH0.WJvqjO_17jyvpzfZ5nH9R2uu86JEgcKzezkTYpsG1vU",
  {
    auth: {
      persistSession: false,
    },
  },
)

// Function to get authenticated client with cookies
export const getAuthenticatedSupabaseClient = () => {
  try {
    const { cookies } = require("next/headers")
    const cookieStore = cookies()

    return createClient(
      supabaseUrl || "https://zlreblmtakgsgqzyyqss.supabase.co",
      supabaseKey ||
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpscmVibG10YWtnc2dxenl5cXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MTE3MDAsImV4cCI6MjA2MTA4NzcwMH0.WJvqjO_17jyvpzfZ5nH9R2uu86JEgcKzezkTYpsG1vU",
      {
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
      },
    )
  } catch (error) {
    console.error("Error creating authenticated Supabase client:", error)
    return supabaseServer
  }
}
