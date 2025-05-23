import { CourseList } from "@/components/course-list"
import { Header } from "@/components/header"

export default function CoursesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6">Cursos Disponibles</h1>
        <CourseList />
      </main>
    </div>
  )
}
