"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { getUserByCuil, checkEnrollment, createEnrollment } from "@/lib/api"
import { AlertCircle, CheckCircle2, Loader2, LogOut } from "lucide-react"

// Tipado real de inscripto según backend
interface Persona {
  nombre: string;
  apellido: string;
  cuil: string;
  // otros campos si los necesitas
}

interface Inscripto {
  cuil: string;
  curso_id: string;
  datos_persona: Persona;
  fecha?: string;
}

interface ManualRegistrationFormProps {
  courseId: string;
  onCourseDeleted?: () => void;
}

export function ManualRegistrationForm({ courseId, onCourseDeleted }: ManualRegistrationFormProps) {
  const [cuil, setCuil] = useState("")
  const [user, setUser] = useState<Persona | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isInscribiendo, setIsInscribiendo] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleCuilSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setUser(null)
    setIsEnrolled(false)
    setSuccess(false)

    try {
      const cuilRegex = /^\d{11}$/
      if (!cuilRegex.test(cuil)) {
        throw new Error("El CUIL debe contener 11 dígitos numéricos")
      }
      const userData = await getUserByCuil(cuil)
      if (!userData) {
        throw new Error("No se encontró un usuario con ese CUIL")
      }
      const alreadyEnrolled = await checkEnrollment(courseId, cuil)
      if (alreadyEnrolled) {
        setIsEnrolled(true)
      }
      setUser(userData)
    } catch (err: any) {
      setError(err.message || "Error al buscar el usuario")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnrollment = async () => {
    if (!user) return
    setIsInscribiendo(true)
    setSuccessMsg("")
    setErrorMsg("")
    try {
      const token = localStorage.getItem("token")
      const body = {
        cuil: String(user.cuil).trim(),
        curso_id: String(courseId)
      }
      // Debug: log values before fetch
      console.log("ENROLL DEBUG", {
        cursoId: courseId,
        cursoIdType: typeof courseId,
        cuil: user.cuil,
        cuilType: typeof user.cuil,
        token,
        body,
      })
      const res = await fetch("/api/inscripciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
      // Debug: log response
      const debugText = await res.clone().text()
      console.log("ENROLL RESPONSE", res.status, debugText)
      if (res.ok) {
        setSuccessMsg("Alumno inscripto con éxito")
        setUser(null)
        setCuil("")
      } else if (res.status === 409) {
        setErrorMsg("Este alumno ya está inscripto en este curso")
      } else {
        setErrorMsg(debugText || "Error al inscribir alumno")
      }
    } catch (err) {
      setErrorMsg("Error al inscribir alumno")
      console.error("ENROLL ERROR", err)
    } finally {
      setIsInscribiendo(false)
    }
  }

  const handleDeleteCourse = async () => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/cursos/${courseId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        toast({ title: "Curso eliminado", description: "El curso fue eliminado correctamente." });
        if (typeof onCourseDeleted === "function") onCourseDeleted();
        router.push("/cursos");
      } else {
        const text = await res.text();
        toast({ title: "Error al eliminar", description: text || "No se pudo eliminar el curso.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error al eliminar", description: "No se pudo eliminar el curso.", variant: "destructive" });
    }
  };

  const handleBack = () => {
    router.push("/cursos")
  }

  return (
    <div className="w-full max-w-lg mx-auto mt-16">
      <Card className="shadow-xl border-gray-100">
        <CardContent className="pt-10 pb-10">
          <form onSubmit={handleCuilSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cuil">CUIL del Alumno</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="cuil"
                  value={cuil}
                  onChange={(e) => setCuil(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Ingrese el CUIL (11 dígitos)"
                  disabled={isLoading || success}
                  maxLength={11}
                  autoComplete="off"
                  list="cuil-list"
                  className={
                    cuil.length === 11
                      ? "border-green-400 focus:border-green-600"
                      : cuil.length > 0
                      ? "border-red-400 focus:border-red-600"
                      : ""
                  }
                />
                <datalist id="cuil-list">
                  <option value="20127872903" />
                  <option value="20439985140" />
                  <option value="20439986142" />
                </datalist>
                <Button type="submit" disabled={isLoading || cuil.length !== 11 || success} size="sm">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
                </Button>
              </div>
              {cuil.length > 0 && cuil.length !== 11 && (
                <span className="text-xs text-red-500">El CUIL debe tener 11 dígitos numéricos</span>
              )}
            </div>
          </form>

          {/* Mostrar datos del alumno si existen */}
          {user && (
            <div className="mt-8 p-4 rounded bg-gray-50 border">
              <div className="mb-2 font-semibold text-gray-700">Datos del alumno:</div>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div><span className="font-medium">Nombre:</span> {user.nombre}</div>
                <div><span className="font-medium">Apellido:</span> {user.apellido}</div>
                <div><span className="font-medium">CUIL:</span> {user.cuil}</div>
                {/* Agrega aquí más campos si los necesitas, por ejemplo dirección, provincia, etc. */}
              </div>
              <Button
                className="mt-6"
                onClick={handleEnrollment}
                disabled={isInscribiendo}
              >
                {isInscribiendo ? (
                  <><Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />Guardando...</>
                ) : (
                  "Inscribir al curso"
                )}
              </Button>
            </div>
          )}

          {/* Mensaje de éxito */}
          {successMsg && (
            <Alert className="mt-4 bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Éxito</AlertTitle>
              <AlertDescription>{successMsg}</AlertDescription>
            </Alert>
          )}

          {/* Mensaje de error */}
          {errorMsg && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          {/* Botón para ver inscriptos del curso */}
          <Button
            variant="outline"
            className="mt-8 w-full"
            asChild
          >
            <Link href={`/curso/${courseId}/inscripciones`}>
              Ver inscriptos del curso
            </Link>
          </Button>

          {/* Botón para eliminar curso */}
          <Button
            variant="destructive"
            className="mt-4 w-full"
            onClick={handleDeleteCourse}
          >
            Eliminar curso
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
