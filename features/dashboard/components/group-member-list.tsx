import Image from "next/image";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/types/team-config";
import { UserAvatar } from "./user-avatar";

type GroupMemberListProps = {
  logins: string[];
  membersByLogin: Map<string, TeamMember>;
  className?: string;
};

export function GroupMemberList({
  logins,
  membersByLogin,
  className,
}: GroupMemberListProps) {
  if (logins.length === 0) {
    return <p className="text-sm text-muted-foreground">No members.</p>;
  }

  return (
    <ul className={cn("space-y-1", className)}>
      {logins.map((login) => {
        const member = membersByLogin.get(login);
        return (
          <li key={login} className="flex items-center gap-2">
            {member ? (
              <Image
                width={20}
                height={20}
                src={member.avatar_url}
                alt=""
                className="size-5 rounded-full"
              />
            ) : (
              <UserAvatar username={login} className="size-5" />
            )}
            <span className={cn("truncate", !member && "opacity-60")}>
              {login}
            </span>
            {!member && (
              <span className="text-[0.7em] opacity-60">(not in team)</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
