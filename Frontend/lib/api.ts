import type { Course, User, Enrollment, CourseFormValues } from "@/lib/types"

// Datos de ejemplo para simular la API
const mockCourses: Course[] = [
  {
    id: "1",
    title: "Introducción a la Programación",
    description: "Curso básico de programación para principiantes",
    startDate: "2024-06-01",
    endDate: "2024-07-30",
    capacity: 30,
    enrolled: 15,
    location: "presencial",
  },
  {
    id: "2",
    title: "Desarrollo Web Frontend",
    description: "HTML, CSS y JavaScript para crear sitios web interactivos",
    startDate: "2024-06-15",
    endDate: "2024-08-15",
    capacity: 25,
    enrolled: 10,
    location: "virtual",
  },
  {
    id: "3",
    title: "Bases de Datos SQL",
    description: "Fundamentos de bases de datos relacionales y SQL",
    startDate: "2024-07-01",
    endDate: "2024-08-30",
    capacity: 20,
    enrolled: 8,
    location: "presencial",
  },
  {
    id: "4",
    title: "Desarrollo de Aplicaciones Móviles",
    description: "Creación de apps para iOS y Android con React Native",
    startDate: "2024-07-15",
    endDate: "2024-09-15",
    capacity: 15,
    enrolled: 5,
    location: "virtual",
  },
]

const mockUsers: Record<string, User> = {
  "20123456789": {
    cuil: "20123456789",
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan.perez@example.com",
    phone: "1123456789",
  },
  "27987654321": {
    cuil: "27987654321",
    firstName: "María",
    lastName: "González",
    email: "maria.gonzalez@example.com",
    phone: "1187654321",
  },
  "20456789012": {
    cuil: "20456789012",
    firstName: "Carlos",
    lastName: "Rodríguez",
    email: "carlos.rodriguez@example.com",
    phone: "1145678901",
  },
  "27345678901": {
    cuil: "27345678901",
    firstName: "Laura",
    lastName: "Fernández",
    email: "laura.fernandez@example.com",
    phone: "1134567890",
  },
}

const mockEnrollments: Enrollment[] = [
  {
    id: "1",
    courseId: "1",
    userId: "20123456789",
    enrollmentDate: "2024-05-15",
  },
  {
    id: "2",
    courseId: "2",
    userId: "27987654321",
    enrollmentDate: "2024-05-16",
  },
  {
    id: "3",
    courseId: "1",
    userId: "20456789012",
    enrollmentDate: "2024-05-17",
  },
  {
    id: "4",
    courseId: "3",
    userId: "27345678901",
    enrollmentDate: "2024-05-18",
  },
  {
    id: "5",
    courseId: "3",
    userId: "20123456789",
    enrollmentDate: "2024-05-19",
  },
]

// Funciones de la API simulada
export async function getCourses(): Promise<Course[]> {
  // Simulamos un delay para imitar una llamada a la API
  await new Promise((resolve) => setTimeout(resolve, 500))
  return [...mockCourses]
}

export async function getCourse(id: string): Promise<Course | null> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockCourses.find((course) => course.id === id) || null
}

export async function getUserByCuil(cuil: string): Promise<User | null> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockUsers[cuil] || null
}

export async function checkEnrollment(courseId: string, cuil: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockEnrollments.some((enrollment) => enrollment.courseId === courseId && enrollment.userId === cuil)
}

export async function createEnrollment(courseId: string, cuil: string): Promise<Enrollment> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Verificar si ya existe la inscripción
  const exists = await checkEnrollment(courseId, cuil)
  if (exists) {
    throw new Error("El usuario ya está inscrito en este curso")
  }

  // Crear nueva inscripción
  const newEnrollment: Enrollment = {
    id: `${mockEnrollments.length + 1}`,
    courseId,
    userId: cuil,
    enrollmentDate: new Date().toISOString().split("T")[0],
  }

  // En un caso real, aquí se guardaría en la base de datos
  mockEnrollments.push(newEnrollment)

  return newEnrollment
}

export async function createCourse(courseData: CourseFormValues): Promise<Course> {
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Crear nuevo curso
  const newCourse: Course = {
    id: `${mockCourses.length + 1}`,
    title: courseData.title,
    description: courseData.description || "",
    startDate: courseData.startDate,
    endDate: courseData.endDate,
    capacity: courseData.capacity,
    enrolled: 0,
    location: courseData.location,
  }

  // En un caso real, aquí se guardaría en la base de datos
  mockCourses.push(newCourse)

  return newCourse
}

export async function getCourseEnrollments(courseId: string): Promise<EnrollmentWithUserData[]> {
  await new Promise((resolve) => setTimeout(resolve, 600))

  const enrollments = mockEnrollments.filter((enrollment) => enrollment.courseId === courseId)

  // Obtener datos completos de cada inscripción
  const enrollmentsWithUserData = enrollments
    .map((enrollment) => {
      const user = mockUsers[enrollment.userId]
      const course = mockCourses.find((course) => course.id === enrollment.courseId)

      return {
        ...enrollment,
        user: user || null,
        course: course || null,
      }
    })
    .filter((item) => item.user !== null && item.course !== null)

  return enrollmentsWithUserData
}

export async function getAllEnrollments(): Promise<EnrollmentWithUserData[]> {
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Obtener datos completos de cada inscripción
  const enrollmentsWithUserData = mockEnrollments
    .map((enrollment) => {
      const user = mockUsers[enrollment.userId]
      const course = mockCourses.find((course) => course.id === enrollment.courseId)

      return {
        ...enrollment,
        user: user || null,
        course: course || null,
      }
    })
    .filter((item) => item.user !== null && item.course !== null)

  return enrollmentsWithUserData
}

export interface EnrollmentWithUserData extends Enrollment {
  user: User | null
  course: Course | null
}
