package controllers

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "gobierno-inscripcion/services"
    "gobierno-inscripcion/models"
    "strconv"
)

func ObtenerCursos(c *gin.Context) {
    // Mapeo para frontend
    cursos := make([]map[string]interface{}, 0, len(services.CursosDisponibles))
    for _, curso := range services.CursosDisponibles {
        cursos = append(cursos, map[string]interface{}{
            "id":          curso.ID,
            "title":       curso.Nombre,
            "description": curso.Descripcion,
            "startDate":   curso.FechaInicio,
            "endDate":     curso.FechaFin,
            "capacity":    curso.Capacidad,
            "enrolled":    0, // O calcula la cantidad real de inscriptos si tienes esa lógica
            "location":    curso.Modalidad,
        })
    }
    c.JSON(http.StatusOK, cursos)
}

func CrearCurso(c *gin.Context) {
    var curso models.Curso
    if err := c.ShouldBindJSON(&curso); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
        return
    }
    // Validaciones básicas
    if curso.Nombre == "" || curso.FechaInicio == "" || curso.FechaFin == "" || curso.Capacidad <= 0 || curso.Modalidad == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Faltan campos obligatorios"})
        return
    }
    // Generar ID si no viene
    if curso.ID == "" {
        curso.ID = strconv.Itoa(len(services.CursosDisponibles) + 1)
    }
    services.CursosDisponibles = append(services.CursosDisponibles, curso)
    c.JSON(http.StatusOK, curso)
}
