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
  // Permite funcionar tanto en server como en client components
  let cursos;
  if (typeof window === "undefined") {
    // Server: usar fetch absoluto
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/cursos` : "http://localhost:3000/api/cursos", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store"
    });
    cursos = await res.json();
  } else {
    // Client: usar axios
    const res = await api.get("/cursos");
    cursos = res.data;
  }
  return cursos.find((c: any) => String(c.id) === String(id)) || null;
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
  // El backend espera { cuil, curso_id }
  const res = await api.post("/inscripciones", { cuil, curso_id: courseId });
  return res.data;
}

export async function createCourse(courseData: any) {
  // Mapeo de campos del frontend al backend
  const totalMinutes = (courseData.durationHours || 0) * 60 + (courseData.durationMinutes || 0);
  const backendData = {
    nombre: courseData.title,
    descripcion: courseData.description,
    fechaInicio: courseData.startDate,
    fechaFin: courseData.endDate,
    duracionMin: totalMinutes,
    capacidad: courseData.capacity,
    modalidad: "presencial",
  };
  const res = await api.post("/curso", backendData);
  return res.data;
}

export async function getCourseEnrollments(courseId: string) {
  const res = await api.get(`/inscripciones?cursoId=${courseId}`);
  return res.data;
}
