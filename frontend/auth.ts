import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "./src/lib/zod";
import axios from "axios";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) {
          console.error("Validation error:", parsed.error.format());
          return null;
        }
        const { username, password } = parsed.data;

        try {
          // Panggil backend kita
          // authorize() di [...nextauth].ts
          const res = await axios.post(
            "https://BitHealth-parking-backend.vercel.app/api/auth/login",
            {
              username: credentials!.username,
              password: credentials!.password,
            },
            // credentials,
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          const { user, token } = res.data;
          if (!user) {
            console.log("Invalid credentials");
            return null;
          }
          // console.log(user);
          // return user;
          // Kembalikan objek user + token
          return {
            id: user.id,
            name: user.username,
            role: user.role,
            accessToken: token,
          };
        } catch (err) {
          console.error("Login error:", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    authorized({ request: { nextUrl }, auth }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;
      const publicPaths = ["/signin", "/"];
      const isPublicPath = publicPaths.includes(pathname);
      if (isPublicPath) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/search", nextUrl));
        } else {
          return true;
        }
      }
      if (!isLoggedIn) {
        return false;
      }
      const role = auth?.user.role || "user";
      if (pathname.startsWith("/payment") && role !== "officer") {
        return Response.redirect(new URL("/search", nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = (user as any).id;
        token.name = (user as any).name;
        token.role = (user as any).role;
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub as string;
      session.user.name = token.name as string;
      session.user.role = token.role as string;
      session.user.accessToken = token.accessToken as string;

      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
});
