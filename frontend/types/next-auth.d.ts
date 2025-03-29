import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    email: string;
    accessToken: string; // Add accessToken to the User type
  }

  interface Session {
    user: {
      email: string;
    };
    accessToken: string; // Add accessToken to the Session type
  }

  interface JWT {
    email: string;
    accessToken: string; // Add accessToken to the JWT type
  }
}