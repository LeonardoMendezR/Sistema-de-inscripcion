"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { getCourseEnrollments } from "@/lib/api"
// Ajustar el tipo de dato y mapeo para los datos planos de inscripciones
// El backend ahora devuelve: id, curso_id, nombre_curso, cuil, nombre, apellido, fecha_inscripcion

interface FlatEnrollment {
  id: number;
  curso_id: number;
  nombre_curso: string;
  cuil: string;
  nombre: string;
  apellido: string;
  fecha_inscripcion: string;
}

import { Download, FileSpreadsheet, FileSpreadsheetIcon as FileCsv } from "lucide-react"
import * as XLSX from "xlsx"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface EnrollmentListProps {
  courseId: string
}

export function EnrollmentList({ courseId }: EnrollmentListProps) {
  const [enrollments, setEnrollments] = useState<FlatEnrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadEnrollments() {
      try {
        const data = await getCourseEnrollments(courseId)
        // Mapeo para soportar campos con mayúscula inicial (Go)
        const normalized = data.map((item: any) => ({
          id: item.id ?? item.ID,
          curso_id: item.curso_id ?? item.CursoID,
          nombre_curso: item.nombre_curso ?? item.NombreCurso,
          cuil: item.cuil ?? item.Cuil,
          nombre: item.nombre ?? item.Nombre,
          apellido: item.apellido ?? item.Apellido,
          fecha_inscripcion: item.fecha_inscripcion ?? item.FechaInscripcion,
        }))
        setEnrollments(normalized)
      } catch (error) {
        console.error("Error al cargar las inscripciones:", error)
      } finally {
        setLoading(false)
      }
    }

    loadEnrollments()
  }, [courseId])

  const exportToExcel = () => {
    if (enrollments.length === 0) return

    // Preparar los datos para la exportación
    const worksheetData = enrollments.map((enrollment) => ({
      CUIL: enrollment.cuil,
      Nombre: enrollment.nombre,
      Apellido: enrollment.apellido,
      "Fecha de Inscripción": enrollment.fecha_inscripcion,
      "Nombre del Curso": enrollment.nombre_curso,
      "ID del Curso": enrollment.curso_id,
    }))

    // Crear libro y hoja de cálculo
    const worksheet = XLSX.utils.json_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inscripciones")

    // Ajustar ancho de columnas
    const columnsWidth = [
      { wch: 15 }, // CUIL
      { wch: 15 }, // Nombre
      { wch: 15 }, // Apellido
      { wch: 25 }, // Fecha de Inscripción
      { wch: 30 }, // Nombre del Curso
      { wch: 10 }, // ID del Curso
    ]
    worksheet["!cols"] = columnsWidth

    // Generar archivo y descargarlo
    XLSX.writeFile(workbook, `inscripciones_curso_${courseId}.xlsx`)
  }

  const exportToCSV = () => {
    if (enrollments.length === 0) return

    // Preparar los datos para la exportación
    const csvData = enrollments.map((enrollment) => ({
      CUIL: enrollment.cuil,
      Nombre: enrollment.nombre,
      Apellido: enrollment.apellido,
      FechaInscripcion: enrollment.fecha_inscripcion,
      NombreCurso: enrollment.nombre_curso,
      IDCurso: enrollment.curso_id,
    }))

    // Crear libro y hoja de cálculo
    const worksheet = XLSX.utils.json_to_sheet(csvData)
    const csv = XLSX.utils.sheet_to_csv(worksheet)

    // Crear blob y descargar
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `inscripciones_curso_${courseId}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Listado de Inscripciones</CardTitle>
          <Skeleton className="h-10 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  // El nombre del curso se puede mostrar arriba
  const courseName = enrollments[0]?.nombre_curso || "-";

  return (
    <Card className="shadow-xl border-gray-100">
      <CardHeader className="bg-gray-50 border-b rounded-t-md flex flex-col gap-2">
        <span className="text-xl font-bold tracking-tight text-primary">{courseName}</span>
        <CardTitle className="text-lg font-bold tracking-tight">Listado de Inscripciones</CardTitle>
      </CardHeader>
      <CardContent>
        {enrollments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay inscripciones registradas para este curso.
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-full text-sm">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>CUIL</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Apellido</TableHead>
                  <TableHead>Fecha de Inscripción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enrollment, idx) => (
                  <TableRow key={enrollment.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <TableCell className="font-mono font-medium">{enrollment.cuil}</TableCell>
                    <TableCell>{enrollment.nombre}</TableCell>
                    <TableCell>{enrollment.apellido}</TableCell>
                    <TableCell>{enrollment.fecha_inscripcion ? new Date(enrollment.fecha_inscripcion).toLocaleString() : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
