"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, History, KanbanSquare } from "lucide-react"

export function ModernHeader({ activePage = "dashboard" }) {
  const pathname = usePathname()

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      current: activePage === "dashboard" || pathname === "/",
    },
    {
      name: "Incidencias",
      href: "/incidencias",
      icon: FileText,
      current: activePage === "incidencias" || pathname.startsWith("/incidencias"),
    },
    {
      name: "Histórico",
      href: "/historico",
      icon: History,
      current: activePage === "historico" || pathname === "/historico",
    },
    {
      name: "Kanban",
      href: "/kanban",
      icon: KanbanSquare,
      current: activePage === "kanban" || pathname === "/kanban",
    },
  ]

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            {/* Replace image with text logo to avoid blob URL issues */}
            <div className="flex items-center justify-center rounded-md bg-primary p-1.5">
              <span className="text-lg font-bold text-primary-foreground">AG</span>
            </div>
            <span className="hidden font-bold sm:inline-block">Andina GLPI</span>
          </Link>
        </div>

        <nav className="flex flex-1 items-center space-x-1 md:space-x-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "inline-flex items-center justify-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground md:px-3",
                item.current ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
