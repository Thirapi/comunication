const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    // SUPABASE_CLIENT_ID: process.env.SUPABASE_CLIENT_ID,
    // SUPABASE_CLIENT_SECRET: process.env.SUPABASE_CLIENT_SECRET,
  },
}

export default nextConfig
