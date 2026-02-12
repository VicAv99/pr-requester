import { cookies } from "next/headers";

const COOKIE_NAME = "github-pat";

export async function getGitHubToken(): Promise<string> {
  const cookieStore = await cookies();
  const pat = cookieStore.get(COOKIE_NAME)?.value;

  if (!pat) {
    throw new Error(
      "No GitHub Personal Access Token found. Please add one in Settings.",
    );
  }

  return pat;
}
