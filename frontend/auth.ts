import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Guest Mode",
      credentials: {
        username: { label: "Username", type: "text" },
      },
      async authorize(credentials) {
        if (credentials?.username === "guest") {
          return {
            id: "guest-user",
            name: "Guest Administrator",
            email: "guest@observability.io",
            image: null,
            isGuest: true,
          };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isGuest = (user as any).isGuest || false;
      }
      return token;
    },
    async session({ session, token }) {
      // Safely attach Google user ID to session
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
      }
      (session.user as any).isGuest = token.isGuest || false;
      return session;
    },
  },
  // NextAuth v5 uses AUTH_SECRET (preferred) with NEXTAUTH_SECRET as fallback
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  // Enable detailed auth logs in development
  debug: process.env.NODE_ENV === "development",
});

