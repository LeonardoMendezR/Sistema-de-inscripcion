"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { login } from "@/lib/api"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    // Limpio token previo
    localStorage.removeItem("token")

    const formData = new FormData(event.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    try {
      const data = await login({ usuario: username, password })
      localStorage.setItem("token", data.token)
      localStorage.setItem("rol", data.rol)
      localStorage.setItem("usuario", data.usuario)
      if (data.rol !== "admin") {
        toast({
          variant: "destructive",
          title: "Acceso denegado",
          description: "Solo los administradores pueden acceder al sistema.",
        })
        setIsLoading(false)
        return
      }
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema de inscripción",
      })
      // Uso replace y forzo recarga para limpiar el estado de Next.js
      router.replace("/cursos")
      window.location.href = "/cursos"
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: error?.response?.data?.error || "Usuario o contraseña incorrectos",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Usuario</Label>
        <Input id="username" name="username" placeholder="Ingrese su usuario" required disabled={isLoading} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Ingrese su contraseña"
          required
          disabled={isLoading}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>
    </form>
  )
}
