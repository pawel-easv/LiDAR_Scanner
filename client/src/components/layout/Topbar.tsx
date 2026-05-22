import { UserMenu } from "@/components/layout/UserMenu";

interface TopbarProps {
  title: string;
  userName: string;
  userAvatar?: string;
}

export function Topbar({ title, userName, userAvatar }: TopbarProps) {
  return (
    <header className="flex items-center justify-between gap-6 py-3">
      <h1 className="text-2xl font-semibold text-ink-900">{title}</h1>

      <UserMenu userName={userName} userAvatar={userAvatar} />
    </header>
  );
}
