"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Home, BarChart2, Inbox, Calendar, Menu, X, Search, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { getIncidenciasActivas } from "@/lib/api/incidencias"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AppHeaderProps {
  activePage?: string
}

export function AppHeader({ activePage }: AppHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [incidenciasEnRiesgo, setIncidenciasEnRiesgo] = useState(0)
  const searchRef = useRef(null)

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

  // Obtener incidencias en riesgo
  useEffect(() => {
    const fetchIncidenciasEnRiesgo = async () => {
      try {
        const incidencias = await getIncidenciasActivas()
        const enRiesgo = incidencias.filter((inc) => inc.ans_estado === "En riesgo")
        setIncidenciasEnRiesgo(enRiesgo.length)
      } catch (error) {
        console.error("Error al obtener incidencias en riesgo:", error)
      }
    }

    fetchIncidenciasEnRiesgo()
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchIncidenciasEnRiesgo, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

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
    <header className="sticky top-0 z-30 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
              A
            </div>
            <span className="hidden md:inline-block text-lg font-google font-medium">Andina Incidencias</span>
          </Link>
        </div>

        <div className="hidden md:flex md:flex-1 md:items-center md:justify-center px-4">
          <div className="relative w-full max-w-md" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar incidencias..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowResults(true)
              }}
            />
            {showResults && searchResults.length > 0 && (
              <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-auto">
                <div className="p-2">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer"
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
                  "flex h-10 items-center gap-2 px-4 text-sm font-medium transition-colors rounded-full",
                  item.current
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full relative" aria-label="Notificaciones">
                  <Bell className="h-5 w-5" />
                  {incidenciasEnRiesgo > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {incidenciasEnRiesgo}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {incidenciasEnRiesgo > 0
                  ? `${incidenciasEnRiesgo} incidencia${incidenciasEnRiesgo !== 1 ? "s" : ""} en riesgo`
                  : "No hay incidencias en riesgo"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="p-4">
            <div className="relative w-full" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar incidencias..."
                className="pl-9 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowResults(true)
                }}
              />
              {showResults && searchResults.length > 0 && (
                <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-auto">
                  <div className="p-2">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer"
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
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
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
