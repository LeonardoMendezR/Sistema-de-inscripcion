"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { getCourseEnrollments } from "@/lib/api"
// Define EnrollmentWithUserData type locally
type EnrollmentWithUserData = {
  id: string
  userId: string
  courseId: string
  enrollmentDate: string
  user?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  }
  course?: {
    title?: string
  }
}
import { Download, FileSpreadsheet, FileSpreadsheetIcon as FileCsv } from "lucide-react"
import * as XLSX from "xlsx"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface EnrollmentListProps {
  courseId: string
}

export function EnrollmentList({ courseId }: EnrollmentListProps) {
  const [enrollments, setEnrollments] = useState<EnrollmentWithUserData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadEnrollments() {
      try {
        const data = await getCourseEnrollments(courseId)
        setEnrollments(data)
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
      CUIL: enrollment.userId,
      Nombre: enrollment.user?.firstName || "",
      Apellido: enrollment.user?.lastName || "",
      Email: enrollment.user?.email || "",
      Teléfono: enrollment.user?.phone || "",
      "Nombre del Curso": enrollment.course?.title || "",
      "ID del Curso": enrollment.courseId,
      "Fecha de Inscripción": enrollment.enrollmentDate,
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
      { wch: 25 }, // Email
      { wch: 15 }, // Teléfono
      { wch: 30 }, // Nombre del Curso
      { wch: 10 }, // ID del Curso
      { wch: 15 }, // Fecha de Inscripción
    ]
    worksheet["!cols"] = columnsWidth

    // Generar archivo y descargarlo
    XLSX.writeFile(workbook, `inscripciones_curso_${courseId}.xlsx`)
  }

  const exportToCSV = () => {
    if (enrollments.length === 0) return

    // Preparar los datos para la exportación
    const csvData = enrollments.map((enrollment) => ({
      CUIL: enrollment.userId,
      Nombre: enrollment.user?.firstName || "",
      Apellido: enrollment.user?.lastName || "",
      Email: enrollment.user?.email || "",
      Telefono: enrollment.user?.phone || "",
      NombreCurso: enrollment.course?.title || "",
      IDCurso: enrollment.courseId,
      FechaInscripcion: enrollment.enrollmentDate,
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

  return (
    <Card className="shadow-xl border-gray-100">
      <CardHeader className="flex flex-row items-center justify-between bg-gray-50 border-b rounded-t-md">
        <CardTitle className="text-lg font-bold tracking-tight">Listado de Inscripciones</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={enrollments.length === 0} variant="outline" size="sm" title="Exportar inscripciones">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportToExcel} className="cursor-pointer">
              <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
              Exportar a Excel (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer">
              <FileCsv className="h-4 w-4 mr-2 text-blue-600" />
              Exportar a CSV (.csv)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                  <TableHead>Fecha de Inscripción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enrollment, idx) => (
                  <TableRow key={enrollment.id || `${enrollment.userId}-${enrollment.courseId}-${idx}`}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <TableCell className="font-mono font-medium">{enrollment.userId}</TableCell>
                    <TableCell>{enrollment.user?.firstName}</TableCell>
                    <TableCell>{enrollment.user?.lastName}</TableCell>
                    <TableCell className="hidden md:table-cell">{enrollment.user?.email || "-"}</TableCell>
                    <TableCell className="hidden md:table-cell">{enrollment.user?.phone || "-"}</TableCell>
                    <TableCell>{new Date(enrollment.enrollmentDate).toLocaleString()}</TableCell>
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
