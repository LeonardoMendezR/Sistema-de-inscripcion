import { Header } from "@/components/header"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { getCourse } from "@/lib/api"
import { notFound } from "next/navigation"

interface QRGeneratorPageProps {
  params: {
    id: string
  }
}

export default async function QRGeneratorPage({ params }: QRGeneratorPageProps) {
  const course = await getCourse(params.id)

  if (!course) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-2">Código QR para Inscripción</h1>
        <h2 className="text-xl mb-6">{course.title}</h2>
        <QRCodeGenerator courseId={params.id} courseTitle={course.title} />
        {/* Enlace visible a la misma URL de inscripción rápida que el QR */}
        <div className="mt-6 flex flex-col items-center">
          <a
            href={`/qr/inscripcion/curso/${params.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline font-medium text-base hover:text-blue-800 transition-colors"
          >
            Ir a página de inscripción
          </a>
        </div>
      </main>
    </div>
  )
}
