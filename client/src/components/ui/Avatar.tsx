import { cn } from "./cn";

interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ name, src, size = 36, className }: AvatarProps) {
  const dimension = { width: size, height: size };
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={dimension}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }
  return (
    <div
      style={dimension}
      className={cn(
        "rounded-full bg-brand-100 text-brand-700 grid place-items-center text-xs font-semibold",
        className,
      )}
    >
      {initials(name)}
    </div>
  );
}
