"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "lucide-react";

export function GitHubLoginButton() {
  return (
    <Button
      className="w-full"
      onClick={() =>
        authClient.signIn.social({
          provider: "github",
          callbackURL: "/",
        })
      }
    >
      <GithubIcon className="size-4" />
      Sign in with GitHub
    </Button>
  );
}
