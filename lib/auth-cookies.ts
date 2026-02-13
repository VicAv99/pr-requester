import { cookies } from "next/headers";

const PAT_COOKIE = "github-pat";
const USER_COOKIE = "github-user";

export type GitHubUser = {
  login: string;
  name: string;
  avatar_url: string;
};

export async function getAuthUser(): Promise<GitHubUser | null> {
  const cookieStore = await cookies();
  const pat = cookieStore.get(PAT_COOKIE)?.value;

  if (!pat) return null;

  const userRaw = cookieStore.get(USER_COOKIE)?.value;
  if (!userRaw) return null;

  try {
    return JSON.parse(userRaw) as GitHubUser;
  } catch {
    return null;
  }
}
