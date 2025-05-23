import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Usa el proxy de Next.js
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export async function login({ usuario, password }: { usuario: string; password: string }) {
  const res = await api.post("/login", { usuario, password });
  // Devuelve token, rol y usuario
  return res.data;
}

export async function getCourses() {
  const res = await api.get("/cursos");
  return res.data;
}

export async function getCourse(id: string) {
  if (typeof window === "undefined") return null;
  const res = await api.get("/cursos");
  const cursos = res.data;
  return cursos.find((c: any) => c.id === id) || null;
}

export async function getUserByCuil(cuil: string) {
  const res = await api.get(`/persona/${cuil}`);
  return res.data;
}

export async function checkEnrollment(courseId: string, cuil: string) {
  const res = await api.get(`/inscripciones?cursoId=${courseId}`);
  if (!Array.isArray(res.data)) return false;
  return res.data.some((enr: any) => enr.cuil === cuil);
}

export async function createEnrollment(courseId: string, cuil: string) {
  const res = await api.post("/inscripciones", { courseId, cuil });
  return res.data;
}

export async function createCourse(courseData: any) {
  // Mapeo de campos del frontend al backend
  const backendData = {
    nombre: courseData.title,
    descripcion: courseData.description,
    fechaInicio: courseData.startDate,
    fechaFin: courseData.endDate,
    capacidad: courseData.capacity,
    modalidad: courseData.location,
  };
  const res = await api.post("/curso", backendData);
  return res.data;
}

export async function getCourseEnrollments(courseId: string) {
  const res = await api.get(`/inscripciones?cursoId=${courseId}`);
  return res.data;
}
