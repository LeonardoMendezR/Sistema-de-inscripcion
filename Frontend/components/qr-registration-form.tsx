"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getUserByCuil, checkEnrollment, createEnrollment } from "@/lib/api"
import type { User } from "@/lib/types"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

interface QRRegistrationFormProps {
  courseId: string
  courseTitle: string
}

export function QRRegistrationForm({ courseId, courseTitle }: QRRegistrationFormProps) {
  const [cuil, setCuil] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleCuilSearch = async () => {
    setIsSearching(true)
    setError(null)
    setUser(null)
    setIsEnrolled(false)

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
      setIsSearching(false)
    }
  }

  const handleEnrollment = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      await createEnrollment(courseId, user.cuil)
      setSuccess(true)
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setError("Ya está inscripto")
      } else {
        setError(err.message || "Error al realizar la inscripción")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inscripción mediante QR</CardTitle>
        <CardDescription>Complete sus datos para inscribirse al curso: {courseTitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cuil">CUIL</Label>
          <div className="flex gap-2">
            <Input
              id="cuil"
              value={cuil}
              onChange={(e) => setCuil(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Ingrese su CUIL (11 dígitos)"
              disabled={isSearching || success}
              maxLength={11}
              autoComplete="off"
              className={
                cuil.length === 11
                  ? "border-green-400 focus:border-green-600"
                  : cuil.length > 0
                  ? "border-red-400 focus:border-red-600"
                  : ""
              }
            />
            <Button onClick={handleCuilSearch} disabled={isSearching || cuil.length !== 11 || success}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
            </Button>
          </div>
          {cuil.length > 0 && cuil.length !== 11 && (
            <span className="text-xs text-red-500">El CUIL debe tener 11 dígitos numéricos</span>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {user && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre</Label>
                <p className="mt-1 font-medium">{user.firstName}</p>
              </div>
              <div>
                <Label>Apellido</Label>
                <p className="mt-1 font-medium">{user.lastName}</p>
              </div>
            </div>

            {isEnrolled && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Usuario ya inscripto</AlertTitle>
                <AlertDescription>Usted ya se encuentra inscripto en este curso.</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle>Inscripción exitosa</AlertTitle>
                <AlertDescription>Ha sido inscripto correctamente al curso.</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>

      {user && !isEnrolled && !success && (
        <CardFooter>
          <Button onClick={handleEnrollment} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              "Confirmar Inscripción"
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
