"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreateCourseForm } from "@/components/create-course-form";
import { Header } from "@/components/header";

export default function CrearCursoPage() {
  const router = useRouter();
  useEffect(() => {
    const rol = typeof window !== "undefined" ? localStorage.getItem("rol") : null;
    if (rol !== "admin") {
      router.replace("/login");
    }
  }, [router]);
  return (
    <>
      <Header />
      <CreateCourseForm />
    </>
  );
}
