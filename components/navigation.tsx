"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { CalendarDays, BarChart3, Settings, PenLine } from "lucide-react"

const navItems = [
  { href: "/", label: "Today", icon: PenLine },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/stats", label: "Statistics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:static md:border-t-0 md:border-r md:min-h-screen md:w-64 z-50">
      <div className="hidden md:block p-6 border-b border-border">
        <h1 className="text-xl font-semibold text-foreground">Daily Progress</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your journey</p>
      </div>
      <ul className="flex justify-around md:flex-col md:p-4 md:gap-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 py-3 md:px-4 md:py-3 rounded-lg transition-colors",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs md:text-sm font-medium">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
