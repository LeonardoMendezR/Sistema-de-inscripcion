"use client"

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ManualRegistrationForm } from "@/components/manual-registration-form";
import { getCourse } from "@/lib/api";

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

  if (loading) return <div>Cargando curso...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;
  if (!course) return <div>Curso no encontrado</div>;

  return <ManualRegistrationForm courseId={course.id} />;
}
