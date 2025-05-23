"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ManualRegistrationForm } from "@/components/manual-registration-form";
import { getCourse } from "@/lib/api";
import { Header } from "@/components/header";

export default function ManualRegistrationPage() {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCourse(id)
      .then((c) => {
        if (!c) {
          setError("Curso no encontrado");
        } else {
          setCourse(c);
        }
      })
      .catch(() => setError("Error al cargar el curso"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6 flex flex-col items-center">
        <div className="w-full max-w-xl">
          <h1 className="text-2xl font-bold mb-2 text-center">Carga Manual de Inscripción</h1>
          {loading && <div className="text-center">Cargando curso...</div>}
          {error && <div className="text-center text-red-600">{error}</div>}
          {course && (
            <>
              <div className="mb-4 text-center">
                <span className="font-semibold">Curso:</span> {course.title}
              </div>
              <ManualRegistrationForm courseId={course.id} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
