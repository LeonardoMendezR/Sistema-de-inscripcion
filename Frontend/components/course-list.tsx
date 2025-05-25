"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { getCourses } from "@/lib/api"
import type { Course } from "@/lib/types"
import { ClipboardList, QrCode, Plus, Download, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function CourseList() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.")) return
    setDeletingId(id)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/cursos/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) {
        setCourses((prev) => prev.filter((c) => c.id !== id))
        toast?.({ title: "Curso eliminado", description: "El curso fue eliminado correctamente." })
      } else {
        const text = await res.text()
        toast?.({ title: "Error al eliminar", description: text || "No se pudo eliminar el curso.", variant: "destructive" })
      }
    } catch (err) {
      toast?.({ title: "Error al eliminar", description: "No se pudo eliminar el curso.", variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    getCourses()
      .then(setCourses)
      .catch((err) => {
        if (err?.response) {
          setError(
            `Error al cargar cursos: ${err.response.status} - ${err.response.data?.error || JSON.stringify(err.response.data)}`
          )
        } else {
          setError("Error al cargar cursos: " + err?.message)
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-10 w-32" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="h-48">
            <CardHeader>
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-8 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
  if (error) return <div className="text-red-600 font-semibold">{error}</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-2">
        <Button asChild size="sm">
          <Link href="/crear-curso">
            <Plus className="h-4 w-4 mr-2" />
            Crear Curso
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, idx) => (
          <Card key={course.id + '-' + idx} className="overflow-hidden shadow border-gray-100">
            <CardHeader className="pb-2 bg-gray-50 border-b">
              <div className="flex justify-between items-start">
                <CardTitle className="mr-2 text-lg font-bold">{course.title}</CardTitle>
                <Badge variant={course.location === "presencial" ? "default" : "outline"}>
                  {course.location === "presencial" ? "Presencial" : "Virtual"}
                </Badge>
              </div>
              <CardDescription>
                {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground min-h-[2.5rem]">{course.description}</p>
              <div className="mt-2 text-sm">
                <span className="font-medium">Capacidad:</span> {course.enrolled}/{course.capacity} inscriptos
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <div className="flex gap-2 w-full sm:w-auto">
                <Button asChild className="flex-1 sm:flex-initial" size="sm">
                  <Link href={`/curso/${course.id}/manual`}>
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Carga Manual
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 sm:flex-initial" size="sm">
                  <Link href={`/curso/${course.id}/qr`}>
                    <QrCode className="h-4 w-4 mr-2" />
                    Generar QR
                  </Link>
                </Button>
              </div>
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                size="sm"
                onClick={() => handleDelete(course.id)}
                disabled={deletingId === course.id}
              >
                {deletingId === course.id ? <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Eliminar
              </Button>
              <Button asChild variant="secondary" className="w-full sm:w-auto" size="sm">
                <Link href={`/curso/${course.id}/inscripciones`}>
                  <Download className="h-4 w-4 mr-2" />
                  Inscripciones
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
