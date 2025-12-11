import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  throw new Error(
    "Google OAuth env vars missing. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
  );
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  callbacks: {
    async signIn({ user, account }: { user: any; account: any }) {
      if (account?.provider === 'google' && user?.email && user?.name) {
        try {
          // Call backend to create/find user and get JWT token
          const response = await fetch('http://localhost:3001/auth/oauth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            // Store backend token in user object so we can access it in jwt callback
            (user as any).backendToken = data.token;
            (user as any).backendUser = data.user;
            return true;
          }
          return false;
        } catch (error) {
          console.error('OAuth backend integration error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user && (user as any).backendToken) {
        token.backendToken = (user as any).backendToken;
        token.backendUser = (user as any).backendUser;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token.backendToken) {
        (session as any).backendToken = token.backendToken;
        (session as any).backendUser = token.backendUser;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
