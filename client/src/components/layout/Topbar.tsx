import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
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

      <div className="flex items-center gap-4">
        <div className="w-72">
          <Input
            type="search"
            placeholder="Search room"
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>

        <UserMenu userName={userName} userAvatar={userAvatar} />
      </div>
    </header>
  );
}
