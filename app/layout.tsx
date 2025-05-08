import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata = {
  title: "Andina Incidencias - Sistema de Gestión de Incidencias",
  description: "Sistema de gestión de incidencias para Andina con estilo Apple",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-apple bg-[#f5f5f7] dark:bg-[#000000]">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
