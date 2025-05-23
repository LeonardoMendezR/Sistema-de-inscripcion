"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { getUserByCuil, checkEnrollment, createEnrollment } from "@/lib/api"
import type { User } from "@/lib/types"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

interface ManualRegistrationFormProps {
  courseId: string
}

export function ManualRegistrationForm({ courseId }: ManualRegistrationFormProps) {
  const [cuil, setCuil] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
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
      // Validar formato de CUIL (2 dígitos + 8 dígitos + 1 dígito verificador)
      const cuilRegex = /^\d{11}$/
      if (!cuilRegex.test(cuil)) {
        throw new Error("El CUIL debe contener 11 dígitos numéricos")
      }

      // Buscar usuario por CUIL
      const userData = await getUserByCuil(cuil)
      if (!userData) {
        throw new Error("No se encontró un usuario con ese CUIL")
      }

      // Verificar si ya está inscripto
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

    setIsLoading(true)
    setError(null)

    try {
      await createEnrollment(courseId, user.cuil)
      setSuccess(true)
      toast({
        title: "Inscripción exitosa",
        description: `${user.firstName} ${user.lastName} ha sido inscripto correctamente`,
      })
    } catch (err: any) {
      setError(err.message || "Error al realizar la inscripción")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push("/cursos")
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleCuilSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cuil">CUIL del Alumno</Label>
              <div className="flex gap-2">
                <Input
                  id="cuil"
                  value={cuil}
                  onChange={(e) => setCuil(e.target.value)}
                  placeholder="Ingrese el CUIL (11 dígitos)"
                  disabled={isLoading}
                  maxLength={11}
                />
                <Button type="submit" disabled={isLoading || cuil.length !== 11}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
                </Button>
              </div>
            </div>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {user && (
            <div className="mt-6 space-y-4">
              <h3 className="font-medium text-lg">Datos del Alumno</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre</Label>
                  <p className="mt-1">{user.firstName}</p>
                </div>
                <div>
                  <Label>Apellido</Label>
                  <p className="mt-1">{user.lastName}</p>
                </div>
                {user.email && (
                  <div>
                    <Label>Email</Label>
                    <p className="mt-1">{user.email}</p>
                  </div>
                )}
                {user.phone && (
                  <div>
                    <Label>Teléfono</Label>
                    <p className="mt-1">{user.phone}</p>
                  </div>
                )}
              </div>

              {isEnrolled ? (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Usuario ya inscripto</AlertTitle>
                  <AlertDescription>Este alumno ya se encuentra inscripto en este curso.</AlertDescription>
                </Alert>
              ) : success ? (
                <Alert className="mt-4 bg-green-50 text-green-800 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>Inscripción exitosa</AlertTitle>
                  <AlertDescription>El alumno ha sido inscripto correctamente al curso.</AlertDescription>
                </Alert>
              ) : (
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                    Cancelar
                  </Button>
                  <Button onClick={handleEnrollment} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Confirmar Inscripción"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
