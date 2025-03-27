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
        const res = await fetch("http://localhost:8000/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        if (!res.ok) {
          const error = await res.json(); // Parse the error response
          throw new Error(error.detail || "Sign-in failed"); // Throw the error message
        }

        const user = await res.json();

        if (user) {
          return { email: credentials?.email }; // Return user object if successful
        }

        return null; // Return null if authentication fails
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email; // Add user email to the token
      }
      return token;
    },
    async session({ session, token }) {
      session.user = { email: token.email }; // Add user email to the session
      return session;
    },
  },
  secret: process.env.SECRET,
  session: {
    strategy: "jwt", // Use JWT for session management
  },
});