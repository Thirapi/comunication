import NextAuth from 'next-auth'
import { SupabaseAdapter } from '@next-auth/supabase-adapter'
import { SupabaseClient } from '@supabase/supabase-js'

const supabase = new SupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const authOptions = {
  providers: [
    {
      id: 'supabase',
      name: 'Supabase',
      type: 'oauth',
      version: '2.0',
      params: { grant_type: 'authorization_code' },
      accessTokenUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token`,
      authorizationUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/authorize`,
      profileUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/userinfo`,
      profile(profile) {
        return { id: profile.sub, ...profile }
      },
      clientId: process.env.SUPABASE_CLIENT_ID,
      clientSecret: process.env.SUPABASE_CLIENT_SECRET,
    },
  ],
  adapter: SupabaseAdapter(supabase),
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
