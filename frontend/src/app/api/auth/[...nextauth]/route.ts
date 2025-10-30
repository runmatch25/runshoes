import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'example-google-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'example-google-secret',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || 'example-facebook-id',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'example-facebook-secret',
    }),
    {
      id: 'strava',
      name: 'Strava',
      type: 'oauth',
      wellKnown: 'https://www.strava.com/.well-known/openid-configuration',
      clientId: process.env.STRAVA_CLIENT_ID || 'example-strava-id',
      clientSecret: process.env.STRAVA_CLIENT_SECRET || 'example-strava-secret',
      authorization: { params: { scope: 'read,activity:read' } },
      idToken: false,
      checks: ['pkce', 'state'],
      profile(profile) {
        return {
          id: profile.id,
          name: profile.username || profile.firstname,
          email: profile.email,
          image: profile.profile
        };
      }
    },
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // Allow any email/password for demo
        if (credentials?.email && credentials?.password) {
          return { id: credentials.email, email: credentials.email, name: credentials.email };
        }
        return null;
      },
    })
  ],
  callbacks: {
    async signIn({ user, account, email }) {
      // Here you would check for duplicate emails with other providers (DB lookup)
      // For demo, always return true
      return true;
    },
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
