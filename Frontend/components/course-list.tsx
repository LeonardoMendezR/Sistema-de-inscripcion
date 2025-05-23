"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { getCourses } from "@/lib/api"
import type { Course } from "@/lib/types"
import { ClipboardList, QrCode, Plus, Download } from "lucide-react"

export function CourseList() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await getCourses()
        setCourses(data)
      } catch (error) {
        console.error("Error al cargar los cursos:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/crear-curso">
            <Plus className="h-4 w-4 mr-2" />
            Crear Curso
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="mr-2">{course.title}</CardTitle>
                <Badge variant={course.location === "presencial" ? "default" : "outline"}>
                  {course.location === "presencial" ? "Presencial" : "Virtual"}
                </Badge>
              </div>
              <CardDescription>
                {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{course.description}</p>
              <div className="mt-2 text-sm">
                <span className="font-medium">Capacidad:</span> {course.enrolled}/{course.capacity} inscriptos
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <div className="flex gap-2 w-full sm:w-auto">
                <Button asChild className="flex-1 sm:flex-initial">
                  <Link href={`/curso/${course.id}/manual`}>
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Carga Manual
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 sm:flex-initial">
                  <Link href={`/curso/${course.id}/qr`}>
                    <QrCode className="h-4 w-4 mr-2" />
                    Generar QR
                  </Link>
                </Button>
              </div>
              <Button asChild variant="secondary" className="w-full sm:w-auto">
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
