import { AppLogo } from "@/components/AppLogo";
import { APP_TAGLINE } from "@/lib/brand";

interface AppHeaderProps {
  subtitle?: string;
  compact?: boolean;
}

export function AppHeader({
  subtitle = APP_TAGLINE,
  compact = false,
}: AppHeaderProps) {  return (
    <header className={`app-header${compact ? " app-header-compact" : ""}`}>
      <div className="app-header-inner">
        <AppLogo size={compact ? 44 : 48} showWordmark variant="light" />
        {!compact && subtitle && (
          <p className="app-header-subtitle">{subtitle}</p>
        )}
      </div>
    </header>
  );
}
