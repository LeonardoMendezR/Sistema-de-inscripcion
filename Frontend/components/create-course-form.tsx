"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { createCourse } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { Header } from "@/components/header"

interface FormData {
  title: string
  startDate: string
  endDate: string
  durationHours: number // horas de duración
  durationMinutes: number // minutos de duración
  description: string
  capacity: number
}

export function CreateCourseForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: "",
    startDate: "",
    endDate: "",
    durationHours: 1,
    durationMinutes: 0,
    description: "",
    capacity: 20,
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const router = useRouter()
  const { toast } = useToast()

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    // Validar título
    if (!formData.title.trim()) {
      newErrors.title = "El nombre del curso es obligatorio"
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "El nombre del curso debe tener al menos 3 caracteres"
    }

    // Validar fechas
    if (!formData.startDate) {
      newErrors.startDate = "La fecha de inicio es obligatoria"
    }
    if (!formData.endDate) {
      newErrors.endDate = "La fecha de fin es obligatoria"
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = "La fecha de fin debe ser posterior o igual a la de inicio"
    }

    // Validar duración
    const totalMinutes = formData.durationHours * 60 + formData.durationMinutes
    if (totalMinutes < 15) {
      newErrors.duration = "La duración debe ser de al menos 15 minutos"
    }

    // Validar capacidad
    if (!formData.capacity || formData.capacity <= 0) {
      newErrors.capacity = "La capacidad debe ser mayor a 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      const { [field]: _omit, ...rest } = errors;
      setErrors(rest);
    }
    // Si se cambia horas o minutos, limpiar error de duración
    if ((field === "durationHours" || field === "durationMinutes") && errors.duration) {
      const { duration, ...rest } = errors;
      setErrors(rest);
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)
    setErrors({})
    try {
      const totalMinutes = formData.durationHours * 60 + formData.durationMinutes
      await createCourse({ ...formData, durationMinutes: totalMinutes })
      toast({ title: "Curso creado", description: "El curso fue creado exitosamente." })
      router.replace("/cursos")
    } catch (err: any) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("rol")
        localStorage.removeItem("usuario")
        toast({
          variant: "destructive",
          title: "Sesión expirada",
          description: "Por favor, inicia sesión nuevamente.",
        })
        router.replace("/login")
      } else {
        toast({
          variant: "destructive",
          title: "Error al crear curso",
          description: err?.response?.data?.error || "Error inesperado",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="max-w-2xl mx-auto mt-8">
        <Card className="shadow-xl border-gray-100">
          <CardContent className="pt-10 pb-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="title">Nombre del curso *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Ej: Introducción a la Programación"
                  className={errors.title ? "border-red-500 focus:border-red-600" : ""}
                  autoFocus
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha de inicio *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className={errors.startDate ? "border-red-500 focus:border-red-600" : ""}
                  />
                  {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha de finalización *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className={errors.endDate ? "border-red-500 focus:border-red-600" : ""}
                  />
                  {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Duración *</Label>
                <div className="flex gap-2 items-center">
                  <div className="flex flex-col items-center">
                    <Input
                      id="durationHours"
                      type="number"
                      min="0"
                      max="23"
                      value={formData.durationHours.toString().padStart(2, '0')}
                      onChange={(e) => handleInputChange("durationHours", Math.max(0, Math.min(23, Number(e.target.value))))}
                      className="w-16 text-center appearance-none"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    <span className="text-xs text-gray-500 mt-1">Horas</span>
                  </div>
                  <span className="text-2xl font-light text-gray-400">:</span>
                  <div className="flex flex-col items-center">
                    <Input
                      id="durationMinutes"
                      type="number"
                      min="0"
                      max="59"
                      value={formData.durationMinutes.toString().padStart(2, '0')}
                      onChange={(e) => handleInputChange("durationMinutes", Math.max(0, Math.min(59, Number(e.target.value))))}
                      className="w-16 text-center appearance-none"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    <span className="text-xs text-gray-500 mt-1">Minutos</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">El curso debe durar al menos 15 minutos</p>
                {errors.duration && <p className="text-xs text-red-500 mt-1">{errors.duration}</p>}
              </div>

              {/* Modalidad fija a presencial */}
              <input type="hidden" name="location" value="presencial" />

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidad máxima *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange("capacity", Number.parseInt(e.target.value) || 0)}
                  className={errors.capacity ? "border-red-500 focus:border-red-600" : ""}
                />
                <p className="text-xs text-muted-foreground">Número máximo de alumnos que pueden inscribirse</p>
                {errors.capacity && <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Ingrese una descripción detallada del curso"
                  className="resize-none"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">Este campo es opcional</p>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t mt-8">
                <Button type="button" variant="outline" onClick={() => router.push("/cursos")} size="sm">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} size="sm">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear Curso"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
