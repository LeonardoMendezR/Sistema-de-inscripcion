"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function Header() {
  const router = useRouter()

  const handleLogout = () => {
    // En un caso real, aquí iría la lógica de cierre de sesión
    router.push("/login")
  }

  return (
    <header className="bg-primary text-primary-foreground shadow">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/cursos" className="text-xl font-bold">
          Sistema de Inscripción
        </Link>
        <Button variant="ghost" onClick={handleLogout} size="sm">
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
        </Button>
      </div>
    </header>
  )
}
