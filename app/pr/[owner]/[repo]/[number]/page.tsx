import type { Metadata } from "next";
import { PRDiffPageContent } from "@/features/pr-diff/components/pr-diff-page-content";

type PageProps = {
  params: Promise<{
    owner: string;
    repo: string;
    number: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { owner, repo, number } = await params;
  return {
    title: `PR #${number} · ${owner}/${repo} — Requester`,
  };
}

export default async function PRDiffPage({ params }: PageProps) {
  const { owner, repo, number } = await params;

  return (
    <PRDiffPageContent
      owner={owner}
      repo={repo}
      number={parseInt(number, 10)}
    />
  );
}
