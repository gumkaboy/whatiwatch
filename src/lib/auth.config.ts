import type { NextAuthConfig } from "next-auth";

const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];
const PUBLIC_PAGES = ["/", ...AUTH_PAGES];

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = AUTH_PAGES.includes(nextUrl.pathname);

      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/library", nextUrl));
        }
        return true;
      }

      if (PUBLIC_PAGES.includes(nextUrl.pathname)) {
        return true;
      }

      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
