package controllers

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "gobierno-inscripcion/services"
    "gobierno-inscripcion/models"
    "strconv"
    "time"
)

func ObtenerCursos(c *gin.Context) {
    // Obtener cursos desde la base de datos
    var cursos []models.Curso
    if err := DB.Find(&cursos).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudieron obtener los cursos"})
        return
    }
    // Mapeo para frontend
    cursosResp := make([]map[string]interface{}, 0, len(cursos))
    for _, curso := range cursos {
        cursosResp = append(cursosResp, map[string]interface{}{
            "id":             curso.ID,
            "title":          curso.Nombre,
            "description":    curso.Descripcion,
            "startDate":      curso.FechaInicio,
            "endDate":        curso.FechaFin,
            "durationMinutes": curso.DuracionMin,
            "capacity":       curso.Capacidad,
            "location":       curso.Lugar,
            "modalidad":      curso.Modalidad,
        })
    }
    c.JSON(http.StatusOK, cursosResp)
}

func CrearCurso(c *gin.Context) {
    var input struct {
        Nombre      string `json:"nombre"`
        Descripcion string `json:"descripcion"`
        FechaInicio string `json:"fechaInicio"`
        FechaFin    string `json:"fechaFin"`
        DuracionMin int    `json:"duracionMin"`
        Capacidad   int    `json:"capacidad"`
        Modalidad   string `json:"modalidad"`
    }
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
        return
    }
    if input.Nombre == "" || input.FechaInicio == "" || input.FechaFin == "" || input.Capacidad <= 0 || input.DuracionMin < 15 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Faltan campos obligatorios o duración menor a 15 minutos"})
        return
    }
    fechaInicio, err := time.Parse("2006-01-02", input.FechaInicio)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Fecha de inicio inválida"})
        return
    }
    fechaFin, err := time.Parse("2006-01-02", input.FechaFin)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Fecha de fin inválida"})
        return
    }
    curso := models.Curso{
        Nombre:      input.Nombre,
        Descripcion: input.Descripcion,
        FechaInicio: fechaInicio,
        FechaFin:    fechaFin,
        DuracionMin: input.DuracionMin,
        Capacidad:   input.Capacidad,
        Modalidad:   input.Modalidad,
    }
    // Guardar el curso en la base de datos con GORM
    if err := DB.Create(&curso).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo crear el curso"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"message": "Curso creado", "curso": curso})
}

func EliminarCurso(c *gin.Context) {
    idStr := c.Param("id")
    id, err := strconv.ParseUint(idStr, 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ID de curso inválido"})
        return
    }
    found := false
    nuevosCursos := make([]models.Curso, 0, len(services.CursosDisponibles))
    for _, curso := range services.CursosDisponibles {
        if curso.ID != uint(id) {
            nuevosCursos = append(nuevosCursos, curso)
        } else {
            found = true
        }
    }
    if !found {
        c.JSON(http.StatusNotFound, gin.H{"error": "Curso no encontrado"})
        return
    }
    services.CursosDisponibles = nuevosCursos
    c.JSON(http.StatusOK, gin.H{"message": "Curso eliminado correctamente"})
}
