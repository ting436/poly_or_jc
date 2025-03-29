import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import * as dotenv from 'dotenv';

dotenv.config();

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }
        const res = await fetch("http://localhost:8000/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.detail || "Sign-in failed");
        }

        const user = await res.json();

        if (user) {
          return { 
            email: credentials.email, 
            accessToken: user.accessToken, 
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Only add user properties on initial sign in
      if (user) {
        return { 
          ...token, 
          email: user.email,
          accessToken: user.accessToken 
        };
      }
      return token;
    },
    async session({ session, token }) {
      // Attach specific properties to session.user
      session.user = {
        email: token.email,
        accessToken: token.accessToken
      };
      return session;
    },
  },
  secret: process.env.SECRET,
  session: {
    strategy: "jwt",
  },
});