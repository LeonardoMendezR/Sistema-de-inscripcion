package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gobierno-inscripcion/services"
)

type VerificacionRequest struct {
	Cuil string `json:"cuil"`
}

func BuscarPersonaHandler(c *gin.Context) {
	var req VerificacionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato inválido de JSON"})
		return
	}

	persona, err := services.ConsultarPersonaPorCUIL(req.Cuil)
	if err != nil {
		if err == services.ErrPersonaNoEncontrada {
			c.JSON(http.StatusNotFound, gin.H{"error": "Persona no encontrada"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, persona)
}

// Buscar persona por CUIL (para endpoint GET)
func BuscarPersonaPorCuil(cuil string) (interface{}, error) {
	persona, err := services.ConsultarPersonaPorCUIL(cuil)
	if err != nil {
		return nil, err
	}
	return persona, nil
}

// Handler para GET /api/persona/:cuil compatible con el frontend
func BuscarPersonaPorCuilHandler(c *gin.Context) {
	cuil := c.Param("cuil")
	persona, err := services.ConsultarPersonaPorCUIL(cuil)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Persona no encontrada"})
		return
	}
	// Solo nombre, apellido y cuil para el frontend
	c.JSON(http.StatusOK, gin.H{
		"cuil": persona.Cuil,
		"firstName": persona.Nombre,
		"lastName": persona.Apellido,
	})
}
