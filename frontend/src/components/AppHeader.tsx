import { AppLogo } from "@/components/AppLogo";

interface AppHeaderProps {
  compact?: boolean;
}

export function AppHeader({ compact = false }: AppHeaderProps) {
  return (
    <header className={`app-header${compact ? " app-header-compact" : ""}`}>
      <div className="app-header-inner">
        <AppLogo size={compact ? 44 : 48} showWordmark variant="light" />
      </div>
    </header>
  );
}
