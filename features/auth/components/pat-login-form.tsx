"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRoundIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { tryCatch } from "@/utils/try-catch";
import { Kbd } from "@/components/ui/kbd";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";

export function PATLoginForm() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = token.trim();
    if (!trimmed) {
      setError("Please enter a Personal Access Token");
      return;
    }

    setIsSubmitting(true);

    const { data: res, error: fetchError } = await tryCatch(
      fetch("/api/github/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: trimmed }),
      }),
    );

    if (fetchError) {
      setError("Network error. Please try again.");
      setIsSubmitting(false);
      return;
    }

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to validate token");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field data-invalid={!!error}>
        <FieldLabel htmlFor="pat">Personal Access Token</FieldLabel>
        <Input
          id="pat"
          type="password"
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            setError(null);
          }}
          autoFocus
        />
        <FieldDescription>
          Create a{" "}
          <a
            href="https://github.com/settings/tokens/new?scopes=repo,read:org,user:email"
            target="_blank"
            rel="noopener noreferrer"
          >
            classic token
          </a>{" "}
          with <Kbd>repo</Kbd>, <Kbd>read:org</Kbd>, and{" "}
          <Kbd>user:email</Kbd> scopes.
        </FieldDescription>
        {error && <FieldError>{error}</FieldError>}
      </Field>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <KeyRoundIcon className="size-4" />
        )}
        {isSubmitting ? "Validating..." : "Sign in"}
      </Button>
    </form>
  );
}
