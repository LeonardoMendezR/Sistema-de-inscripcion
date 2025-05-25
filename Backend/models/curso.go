package models

import (
	"time"
)

type Curso struct {
	ID            uint      `gorm:"primaryKey"`
	Nombre        string    `gorm:"not null"`
	Descripcion   string    `gorm:"type:text"`
	FechaInicio   time.Time `gorm:"type:date"`
	FechaFin      time.Time `gorm:"type:date"`
	DuracionMin   int       `gorm:"not null"`
	Capacidad     int       `gorm:"not null;check:capacidad > 0"`
	Lugar         string
	Modalidad     string    `gorm:"type:text"`
	Inscripciones []Inscripcion `gorm:"foreignKey:CursoID;constraint:OnDelete:CASCADE"`
}
