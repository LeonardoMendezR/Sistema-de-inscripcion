package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gobierno-inscripcion/models"
	"gobierno-inscripcion/services"
	"gorm.io/gorm"
)

// Asume que tienes una variable global DB *gorm.DB inicializada en main.go
var DB *gorm.DB

func SetDB(db *gorm.DB) {
	DB = db
}

type InscripcionRequest struct {
	Cuil    string `json:"cuil" binding:"required"`
	CursoID uint   `json:"curso_id" binding:"required"`
}

// POST /inscripciones
func InscribirPersona(c *gin.Context) {
	var request InscripcionRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "CUIL y curso_id son requeridos"})
		return
	}

	// Validar existencia de persona SOLO consulta SOAP si no existe en DB
	var persona models.Persona
	dbErr := DB.First(&persona, "cuil = ?", request.Cuil).Error
	if dbErr != nil {
		// Consultar al servicio SOAP
		soapPersona, errSoap := services.ConsultarPersonaPorCUIL(request.Cuil)
		if errSoap != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Persona no encontrada en padrón provincial"})
			return
		}
		// Validar que los campos requeridos no estén vacíos
		if soapPersona.Cuil == "" || soapPersona.Nombre == "" || soapPersona.Apellido == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Datos incompletos de la persona desde el padrón provincial"})
			return
		}
		// Usar los datos del padrón para la inscripción
		persona = models.Persona{
			Cuil:     soapPersona.Cuil,
			Nombre:   soapPersona.Nombre,
			Apellido: soapPersona.Apellido,
		}
	}

	// Validar existencia de curso
	var curso models.Curso
	if err := DB.First(&curso, request.CursoID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Curso no encontrado"})
		return
	}

	// Validar inscripción duplicada
	var existente models.Inscripcion
	if err := DB.Where("curso_id = ? AND cuil = ?", request.CursoID, request.Cuil).First(&existente).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "La persona ya está inscrita en este curso"})
		return
	}

	inscripcion := models.Inscripcion{
		CursoID:     request.CursoID,
		NombreCurso: curso.Nombre,
		Cuil:        persona.Cuil,
		Nombre:      persona.Nombre,
		Apellido:    persona.Apellido,
	}
	if err := DB.Create(&inscripcion).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo inscribir"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Inscripción exitosa",
		"inscripcion": inscripcion,
	})
}

// GET /inscripciones?curso_id=XX
func ObtenerInscritos(c *gin.Context) {
	cursoID := c.Query("curso_id")
	var inscripciones []models.Inscripcion
	query := DB.Model(&models.Inscripcion{})
	if cursoID != "" {
		query = query.Where("curso_id = ?", cursoID)
	}
	if err := query.Find(&inscripciones).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener inscripciones"})
		return
	}
	c.JSON(http.StatusOK, inscripciones)
}
