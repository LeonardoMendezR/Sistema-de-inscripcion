import { Header } from "@/components/header"
import { CreateCourseForm } from "@/components/create-course-form"

export default function CreateCoursePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6">Crear Nuevo Curso</h1>
        <CreateCourseForm />
      </main>
    </div>
  )
}
