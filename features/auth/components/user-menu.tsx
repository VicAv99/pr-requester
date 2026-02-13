"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOutIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import type { GitHubUser } from "@/lib/auth-cookies";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserMenuProps = {
  user: GitHubUser | null;
};

export function UserMenu({ user }: Readonly<UserMenuProps>) {
  const router = useRouter();

  if (!user) {
    return null;
  }

  const displayName = user.name || user.login;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={displayName}
            width={32}
            height={32}
            className="size-8 rounded-full"
          />
        ) : (
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {displayName[0]?.toUpperCase()}
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <SettingsIcon className="size-3.5" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            await fetch("/api/github/token", { method: "DELETE" });
            router.push("/login");
          }}
        >
          <LogOutIcon className="size-3.5" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
