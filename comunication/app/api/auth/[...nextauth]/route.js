import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = { id: 1, name: 'User', email: 'user@example.com' };
        if (user) {
          return user;
        } else {
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: null
  },
  secret: process.env.NEXTAUTH_SECRET, // Set secret key
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    }
  }
};

const handler = (req, res) => NextAuth(req, res, authOptions);

export { handler as GET, handler as POST };
