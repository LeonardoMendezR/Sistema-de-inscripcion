export interface Course {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  capacity: number
  enrolled: number
  location: "presencial" | "virtual"
}

export interface User {
  cuil: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
}

export interface Enrollment {
  id: string
  courseId: string
  userId: string
  enrollmentDate: string
}

export interface CourseFormValues {
  title: string
  startDate: string
  endDate: string
  location: "presencial" | "virtual"
  description?: string
  capacity: number
}

export interface EnrollmentWithUserData extends Enrollment {
  user: User | null
  course: Course | null
}
