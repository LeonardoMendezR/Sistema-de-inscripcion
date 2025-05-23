import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Página no encontrada</h2>
      <p className="text-muted-foreground mb-6 text-center">La página que estás buscando no existe o ha sido movida.</p>
      <Button asChild>
        <Link href="/cursos">Volver a Cursos</Link>
      </Button>
    </div>
  )
}
