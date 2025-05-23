package routes

import (
	"github.com/gin-gonic/gin"
	"gobierno-inscripcion/controllers"
)

func RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		// Login demo
		api.POST("/login", func(c *gin.Context) {
			var req struct {
				Usuario  string `json:"usuario"`
				Password string `json:"password"`
			}
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(400, gin.H{"error": "Datos inválidos"})
				return
			}
			if req.Usuario == "admin" && req.Password == "admin" {
				c.JSON(200, gin.H{
					"token": "demo-token",
					"rol": "admin",
					"usuario": req.Usuario,
				})
				return
			}
			c.JSON(401, gin.H{"error": "Credenciales incorrectas"})
		})

		// Cursos
		api.GET("/cursos", controllers.ObtenerCursos)
		api.POST("/curso", controllers.CrearCurso)

		// Persona (GET por CUIL)
		api.GET("/persona/:cuil", controllers.BuscarPersonaPorCuilHandler)

		// Inscripciones
		api.POST("/inscripciones", controllers.InscribirPersona)
		api.GET("/inscripciones", controllers.ObtenerInscritos)
	}
}
