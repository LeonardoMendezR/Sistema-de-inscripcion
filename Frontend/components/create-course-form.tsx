"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { createCourse } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface FormData {
  title: string
  startDate: string
  endDate: string
  location: "presencial" | "virtual"
  description: string
  capacity: number
}

export function CreateCourseForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: "",
    startDate: "",
    endDate: "",
    location: "presencial",
    description: "",
    capacity: 20,
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const router = useRouter()
  const { toast } = useToast()

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

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
      newErrors.endDate = "La fecha de fin debe ser posterior a la de inicio"
    }

    // Validar capacidad
    if (!formData.capacity || formData.capacity <= 0) {
      newErrors.capacity = undefined // El campo es number, no string
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)
    setErrors({})
    try {
      await createCourse(formData)
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
    <Card className="max-w-2xl mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Nombre del curso *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Ej: Introducción a la Programación"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de inicio *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className={errors.startDate ? "border-red-500" : ""}
              />
              {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de finalización *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                className={errors.endDate ? "border-red-500" : ""}
              />
              {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Modalidad *</Label>
            <RadioGroup
              value={formData.location}
              onValueChange={(value: "presencial" | "virtual") => handleInputChange("location", value)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="presencial" id="presencial" />
                <Label htmlFor="presencial" className="font-normal">
                  Presencial
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="virtual" id="virtual" />
                <Label htmlFor="virtual" className="font-normal">
                  Virtual
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacidad máxima *</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => handleInputChange("capacity", Number.parseInt(e.target.value) || 0)}
              className={errors.capacity ? "border-red-500" : ""}
            />
            <p className="text-sm text-muted-foreground">Número máximo de alumnos que pueden inscribirse</p>
            {errors.capacity && <p className="text-sm text-red-500">{errors.capacity}</p>}
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
            <p className="text-sm text-muted-foreground">Este campo es opcional</p>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/cursos")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
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
  )
}
