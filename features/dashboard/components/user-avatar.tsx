import { cn } from "@/lib/utils";

type UserAvatarProps = {
  username: string;
  className?: string;
};

function hashString(str: string): number {
  return str.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

export function UserAvatar({ username, className }: UserAvatarProps) {
  const initial = username[0].toUpperCase();
  const hue = hashString(username) % 360;

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full text-[0.6em] font-semibold leading-none text-white",
        className
      )}
      style={{ backgroundColor: `oklch(0.62 0.16 ${hue})` }}
      title={username}
    >
      {initial}
    </div>
  );
}
