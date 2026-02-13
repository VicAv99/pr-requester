"use client";

import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { CheckIcon, KeyIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { OrgSelect } from "@/features/team-config/components/org-select";
import { TeamSelect } from "@/features/team-config/components/team-select";
import { teamConfigQueries } from "@/features/team-config/queries";
import {
  getTeamConfig,
  setTeamConfig,
} from "@/features/team-config/utils/team-config-storage";
import type {
  GitHubOrg,
  TeamConfig,
  TeamWithMembers,
} from "@/types/team-config";

export function TeamConfigForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [pat, setPat] = useState("");
  const [patSaved, setPatSaved] = useState(false);
  const [patSaving, setPatSaving] = useState(false);
  const [patError, setPatError] = useState<string | null>(null);

  const [selectedOrg, setSelectedOrg] = useState<GitHubOrg | null>(null);
  const [selectedTeamSlugs, setSelectedTeamSlugs] = useState<string[]>([]);

  // Hydrate from localStorage + check if PAT is already stored
  useEffect(() => {
    const existing = getTeamConfig();
    if (existing) {
      setSelectedOrg({
        login: existing.org,
        avatar_url: existing.orgAvatarUrl,
        description: null,
      });
      setSelectedTeamSlugs(existing.teams.map((t) => t.slug));
    }

    fetch("/api/github/orgs").then((res) => {
      if (res.ok) setPatSaved(true);
    });
  }, []);
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePat = useCallback(async () => {
    if (!pat.trim()) return;

    setPatSaving(true);
    setPatError(null);

    try {
      // Save the PAT as an httpOnly cookie
      const res = await fetch("/api/github/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: pat.trim() }),
      });

      if (!res.ok) {
        setPatError("Failed to save token");
        return;
      }

      // Verify the token works by fetching orgs
      const orgsRes = await fetch("/api/github/orgs");
      if (!orgsRes.ok) {
        setPatError(
          "Token saved but could not access GitHub. Check the token has read:org scope.",
        );
        // Clear the invalid token
        await fetch("/api/github/token", { method: "DELETE" });
        return;
      }

      setPatSaved(true);
      setPat("");

      // Invalidate cached queries so they refetch with the new token
      queryClient.invalidateQueries({
        queryKey: teamConfigQueries.all(),
      });
    } finally {
      setPatSaving(false);
    }
  }, [pat, queryClient]);

  const handleOrgChange = useCallback((org: GitHubOrg | null) => {
    setSelectedOrg(org);
    setSelectedTeamSlugs([]);
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedOrg || selectedTeamSlugs.length === 0) return;

    setIsSaving(true);

    const teamsWithMembers: TeamWithMembers[] = await Promise.all(
      selectedTeamSlugs.map(async (slug) => {
        const members = await queryClient.fetchQuery(
          teamConfigQueries.members(selectedOrg.login, slug),
        );

        const teamsData = queryClient.getQueryData(
          teamConfigQueries.teams(selectedOrg.login).queryKey,
        );
        const team = teamsData?.find((t) => t.slug === slug);

        return {
          slug,
          name: team?.name ?? slug,
          members: members.map((m) => ({
            login: m.login,
            avatar_url: m.avatar_url,
          })),
        };
      }),
    );

    const config: TeamConfig = {
      org: selectedOrg.login,
      orgAvatarUrl: selectedOrg.avatar_url,
      teams: teamsWithMembers,
    };

    setTeamConfig(config);
    setIsSaving(false);
    router.push("/");
  }, [selectedOrg, selectedTeamSlugs, queryClient, router]);

  const canSave = selectedOrg && selectedTeamSlugs.length > 0;

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Team Configuration</CardTitle>
        <CardDescription>
          Add your GitHub Personal Access Token and select your organization and
          teams to track review requests.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Field>
          <FieldLabel>GitHub Personal Access Token</FieldLabel>
          <FieldDescription>
            Create a{" "}
            <a
              href="https://github.com/settings/tokens/new?scopes=repo,read:org&description=Requester"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2"
            >
              fine-grained or classic PAT
            </a>{" "}
            with <code className="text-xs">repo</code> and{" "}
            <code className="text-xs">read:org</code> scopes.
          </FieldDescription>
          {patSaved ? (
            <div className="flex h-9 items-center justify-between gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 text-sm text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center gap-2">
                <CheckIcon className="size-4" />
                Token saved.
              </span>
              <button
                type="button"
                onClick={() => setPatSaved(false)}
                className="text-xs underline underline-offset-2 opacity-70 hover:opacity-100"
              >
                Change token
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={pat}
                onChange={(e) => setPat(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSavePat();
                  }
                }}
                className="font-mono text-xs"
              />
              <Button
                onClick={handleSavePat}
                disabled={!pat.trim() || patSaving}
                size="sm"
                className="shrink-0"
              >
                {patSaving ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <KeyIcon className="size-4" />
                )}
                Save Token
              </Button>
            </div>
          )}
          {patError && (
            <p className="text-xs text-destructive">{patError}</p>
          )}
        </Field>

        {patSaved && (
          <>
            <OrgSelect
              value={selectedOrg?.login ?? null}
              onValueChange={handleOrgChange}
            />
            <TeamSelect
              org={selectedOrg?.login ?? null}
              value={selectedTeamSlugs}
              onValueChange={setSelectedTeamSlugs}
            />
          </>
        )}
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline" onClick={() => router.push("/")}>
          Cancel
        </Button>
        <Button disabled={!canSave || isSaving} onClick={handleSave}>
          {isSaving ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <CheckIcon className="size-4" />
          )}
          Save Configuration
        </Button>
      </CardFooter>
    </Card>
  );
}
