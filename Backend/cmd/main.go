package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/gin-contrib/cors"

	"gobierno-inscripcion/routes"
	"gobierno-inscripcion/models"
	"gobierno-inscripcion/controllers"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	// Cargar variables de entorno desde .env SOLO si no estamos en Docker
	// (En Docker Compose, las variables ya están en el entorno)
	if os.Getenv("RUNNING_IN_DOCKER") != "true" {
		if err := godotenv.Load(); err != nil {
			log.Println("No se pudo cargar el archivo .env, usando valores por defecto")
		}
	}

	// Conexión a MySQL
	dsn := os.Getenv("MYSQL_DSN")
	if dsn == "" {
		// Formato: usuario:password@tcp(host:puerto)/dbname?parseTime=true
		dsn = "root:password@tcp(127.0.0.1:3306)/sistema_inscripciones?parseTime=true"
	}
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("No se pudo conectar a la base de datos:", err)
	}

	// Migraciones automáticas
	db.AutoMigrate(&models.Curso{}, &models.Persona{}, &models.Inscripcion{}, &models.Usuario{})

	// Inyectar DB en el controlador de inscripciones
	controllers.SetDB(db)
	// Inyectar DB en el controlador de cursos
	controllers.SetDB(db)

	// Inicializar router Gin
	router := gin.Default()

	// Habilitar CORS para permitir requests del frontend
	router.Use(cors.Default())

	router.Static("/static", "./static")

	// Ruta raíz que carga index.html explícitamente
	router.GET("/", func(c *gin.Context) {
		c.File("./static/index.html")
	})

	// Registrar rutas de la API
	routes.RegisterRoutes(router)

	// Leer el puerto desde el entorno o usar 8080 por defecto
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Iniciar servidor
	log.Println("Servidor corriendo en puerto " + port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("No se pudo iniciar el servidor:", err)
	}
}
