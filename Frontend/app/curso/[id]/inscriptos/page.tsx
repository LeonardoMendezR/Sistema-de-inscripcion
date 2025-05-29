"use client";
import { Header } from "@/components/header";
import { EnrollmentList } from "@/components/enrollment-list";
import { useParams } from "next/navigation";

export default function InscriptosPage() {
  const params = useParams();
  const cursoId = params?.id as string;
  if (!cursoId) return <div>Curso no encontrado</div>;
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <EnrollmentList courseId={cursoId} />
      </main>
    </div>
  );
}
