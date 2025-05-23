import { QRRegistrationForm } from "@/components/qr-registration-form"
import { getCourse } from "@/lib/api"
import { notFound } from "next/navigation"

interface QRRegistrationPageProps {
  params: {
    id: string
  }
}

export default async function QRRegistrationPage({ params }: QRRegistrationPageProps) {
  const course = await getCourse(params.id)

  if (!course) {
    notFound()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Inscripción a Curso</h1>
          <p className="text-muted-foreground">{course.title}</p>
        </div>
        <QRRegistrationForm courseId={params.id} courseTitle={course.title} />
      </div>
    </div>
  )
}
