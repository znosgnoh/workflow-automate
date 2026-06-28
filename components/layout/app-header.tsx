import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/workflows/costco", label: "Costco Report" },
] as const;

export function AppHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Workflow Automate
        </Link>
        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-3 text-sm font-medium text-muted transition-colors",
                    "hover:bg-background hover:text-foreground",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
