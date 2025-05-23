"use client"

import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Download, Share2 } from "lucide-react"

interface QRCodeGeneratorProps {
  courseId: string
  courseTitle: string
}

export function QRCodeGenerator({ courseId, courseTitle }: QRCodeGeneratorProps) {
  const [qrUrl, setQrUrl] = useState("")
  const [baseUrl, setBaseUrl] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    // Obtener la URL base del sitio
    const url = window.location.origin
    setBaseUrl(url)
    setQrUrl(`${url}/qr/inscripcion/curso/${courseId}`)
  }, [courseId])

  const handleDownload = () => {
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    // Crear un nuevo canvas con espacio para el título
    const newCanvas = document.createElement("canvas")
    const padding = 20
    const titleHeight = 40
    newCanvas.width = canvas.width + padding * 2
    newCanvas.height = canvas.height + padding * 2 + titleHeight

    const newContext = newCanvas.getContext("2d")
    if (!newContext) return

    // Fondo blanco
    newContext.fillStyle = "white"
    newContext.fillRect(0, 0, newCanvas.width, newCanvas.height)

    // Dibujar título
    newContext.fillStyle = "black"
    newContext.font = "bold 16px Arial"
    newContext.textAlign = "center"
    newContext.fillText(courseTitle, newCanvas.width / 2, titleHeight / 2 + 10)

    // Dibujar QR
    newContext.drawImage(canvas, padding, titleHeight + padding)

    // Crear link de descarga
    const link = document.createElement("a")
    link.download = `qr-inscripcion-${courseId}.png`
    link.href = newCanvas.toDataURL("image/png")
    link.click()

    toast({
      title: "QR descargado",
      description: "El código QR ha sido descargado correctamente",
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Inscripción al curso: ${courseTitle}`,
          text: "Escanea este código QR para inscribirte al curso",
          url: qrUrl,
        })
        toast({
          title: "Compartido",
          description: "El enlace ha sido compartido correctamente",
        })
      } catch (error) {
        console.error("Error al compartir:", error)
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(qrUrl)
      toast({
        title: "Enlace copiado",
        description: "El enlace ha sido copiado al portapapeles",
      })
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardContent className="pt-6 flex flex-col items-center">
          <div className="mb-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">Escanea este código QR para inscribirte al curso:</p>
            <p className="font-medium">{courseTitle}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <QRCodeSVG id="qr-code-canvas" value={qrUrl} size={200} level="H" includeMargin={true} />
          </div>

          <div className="text-xs text-muted-foreground mb-4 text-center">
            <p>URL de inscripción:</p>
            <p className="font-mono break-all">{qrUrl}</p>
          </div>

          <div className="flex gap-2 w-full">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Descargar QR
            </Button>
            <Button variant="outline" onClick={handleShare} className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
