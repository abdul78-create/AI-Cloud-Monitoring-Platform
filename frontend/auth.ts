import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

// Safe console logging to confirm environment variables exist without exposing secrets
if (typeof window === "undefined") {
  const hasGoogleId = !!process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== "placeholder-google-client-id";
  const hasGoogleSecret = !!process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_SECRET !== "placeholder-google-client-secret";
  console.log("[Auth Config] Diagnostics:");
  console.log(`  - GOOGLE_CLIENT_ID exists: ${hasGoogleId}`);
  console.log(`  - GOOGLE_CLIENT_SECRET exists: ${hasGoogleSecret}`);
  console.log(`  - AUTH_SECRET exists: ${!!process.env.AUTH_SECRET}`);
  console.log(`  - NEXTAUTH_SECRET exists: ${!!process.env.NEXTAUTH_SECRET}`);
  console.log(`  - NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || "not set"}`);
}

// Ensure no undefined environment variables can crash Auth.js during runtime or build
if (typeof window === "undefined") {
  if (!process.env.GOOGLE_CLIENT_ID) {
    process.env.GOOGLE_CLIENT_ID = "placeholder-google-client-id";
  }
  if (!process.env.GOOGLE_CLIENT_SECRET) {
    process.env.GOOGLE_CLIENT_SECRET = "placeholder-google-client-secret";
  }
  if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
    process.env.AUTH_SECRET = "placeholder-auth-secret-prevent-runtime-crash-123456";
  }
}

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

