package models

import (
	"time"
)

type Inscripcion struct {
	ID               uint      `gorm:"primaryKey"`
	CursoID          uint      `gorm:"not null;index"`
	NombreCurso      string    `gorm:"not null"`
	Cuil             string    `gorm:"not null;size:11;index"`
	Nombre           string    `gorm:"not null"`
	Apellido         string    `gorm:"not null"`
	FechaInscripcion time.Time `gorm:"autoCreateTime"`
}

func (Inscripcion) TableName() string {
	return "inscripciones"
}
