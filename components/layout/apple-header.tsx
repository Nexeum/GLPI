"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Home, BarChart2, Inbox, Calendar, Settings, Menu, X, Search, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getIncidenciasActivas } from "@/lib/api/incidencias"
import { Card } from "@/components/ui/card"

interface AppleHeaderProps {
  activePage?: string
}

export function AppleHeader({ activePage }: AppleHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home, current: activePage === "dashboard" || pathname === "/" },
    {
      name: "Incidencias",
      href: "/incidencias",
      icon: Inbox,
      current: activePage === "incidencias" || pathname.startsWith("/incidencias"),
    },
    {
      name: "Histórico",
      href: "/historico",
      icon: Calendar,
      current: activePage === "historico" || pathname === "/historico",
    },
    { name: "Kanban", href: "/kanban", icon: BarChart2, current: activePage === "kanban" || pathname === "/kanban" },
  ]

  // Detectar scroll para cambiar el estilo del header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Búsqueda en tiempo real
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim().length > 2) {
        try {
          const incidencias = await getIncidenciasActivas()
          const filtered = incidencias.filter(
            (inc) =>
              inc.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              inc.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              inc.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()),
          )
          setSearchResults(filtered.slice(0, 5)) // Limitamos a 5 resultados
          setShowResults(true)
        } catch (error) {
          console.error("Error al buscar incidencias:", error)
        }
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }

    const timeoutId = setTimeout(() => {
      fetchSearchResults()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSearchItemClick = (id) => {
    router.push(`/incidencias/${id}`)
    setShowResults(false)
    setSearchQuery("")
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full transition-all duration-300",
        scrolled
          ? "bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50"
          : "bg-transparent",
      )}
    >
      <div className="flex h-16 items-center px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold">
              A
            </div>
            <span className="hidden md:inline-block text-lg font-semibold">Andina</span>
          </Link>
        </div>

        <div className="hidden md:flex md:flex-1 md:items-center md:justify-center px-4">
          <div className="relative w-full max-w-md" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar incidencias..."
              className="apple-input pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowResults(true)
              }}
            />
            {showResults && searchResults.length > 0 && (
              <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-auto apple-glass-card animate-fade-in">
                <div className="p-2">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-2 hover:bg-gray-100/50 dark:hover:bg-gray-800/30 rounded-md cursor-pointer transition-colors"
                      onClick={() => handleSearchItemClick(result.id)}
                    >
                      <div className="font-medium">{result.titulo}</div>
                      <div className="text-sm text-gray-500">#{result.id}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex h-9 items-center gap-2 px-4 text-sm font-medium transition-colors rounded-full",
                  item.current
                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300"
                    : "text-gray-600 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-gray-800/30",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-white">MD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="apple-glass-card">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Cerrar sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-md animate-fade-in">
          <div className="p-4">
            <div className="relative w-full" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar incidencias..."
                className="apple-input pl-9 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowResults(true)
                }}
              />
              {showResults && searchResults.length > 0 && (
                <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-auto apple-glass-card">
                  <div className="p-2">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="p-2 hover:bg-gray-100/50 dark:hover:bg-gray-800/30 rounded-md cursor-pointer transition-colors"
                        onClick={() => handleSearchItemClick(result.id)}
                      >
                        <div className="font-medium">{result.titulo}</div>
                        <div className="text-sm text-gray-500">#{result.id}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
          <nav className="flex flex-col p-4 pt-0 gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex h-10 items-center gap-2 px-4 text-sm font-medium transition-colors rounded-full",
                  item.current
                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300"
                    : "text-gray-600 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-gray-800/30",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
