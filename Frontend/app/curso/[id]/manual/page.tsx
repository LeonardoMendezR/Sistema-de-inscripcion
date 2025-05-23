import { Header } from "@/components/header"
import { ManualRegistrationForm } from "@/components/manual-registration-form"
import { getCourse } from "@/lib/api"
import { notFound } from "next/navigation"

interface ManualRegistrationPageProps {
  params: {
    id: string
  }
}

export default async function ManualRegistrationPage({ params }: ManualRegistrationPageProps) {
  const course = await getCourse(params.id)

  if (!course) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-2">Inscripción Manual</h1>
        <h2 className="text-xl mb-6">{course.title}</h2>
        <ManualRegistrationForm courseId={params.id} />
      </main>
    </div>
  )
}
