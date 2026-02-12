import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { env } from "@/lib/env";

export const auth = betterAuth({
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      scope: ["repo", "read:org", "user:email"],
    },
  },
  account: {
    storeAccountCookie: true,
  },
  plugins: [nextCookies()],
});
