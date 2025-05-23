import { Header } from "@/components/header"
import { EnrollmentList } from "@/components/enrollment-list"
import { getCourse } from "@/lib/api"
import { notFound } from "next/navigation"

interface EnrollmentsPageProps {
  params: {
    id: string
  }
}

export default async function EnrollmentsPage({ params }: EnrollmentsPageProps) {
  const course = await getCourse(params.id)

  if (!course) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-2">Inscripciones</h1>
        <h2 className="text-xl mb-6">{course.title}</h2>
        <EnrollmentList courseId={params.id} />
      </main>
    </div>
  )
}
