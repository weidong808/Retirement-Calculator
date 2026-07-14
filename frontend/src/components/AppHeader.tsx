"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppLogo } from "@/components/AppLogo";
import { Container } from "@/components/Container";
import { SiteHomeLink } from "@/components/SiteHomeLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Calculator" },
  { href: "/about", label: "About" },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="app-header">
      <Container className="app-header-inner">
        <Link href="/" className="app-header-brand" aria-label="RetireCheck home">
          <AppLogo size={34} showWordmark layout="row" variant="dark" />
        </Link>

        <nav className="app-header-nav" aria-label="Primary">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("app-header-link", active && "app-header-link--active")}
              >
                {item.label}
              </Link>
            );
          })}
          <SiteHomeLink variant="compact" className="app-header-link app-header-site" markSize={18} />
          <a
            href="https://www.ssa.gov/planners/retire/"
            target="_blank"
            rel="noopener noreferrer"
            className="app-header-link"
          >
            SSA.gov
          </a>
          <ThemeToggle />
        </nav>
      </Container>
    </header>
  );
}
