package models

type Persona struct {
	Cuil     string `gorm:"primaryKey;size:11"`
	Nombre   string `gorm:"not null"`
	Apellido string `gorm:"not null"`
	Email    string
	Telefono string
}
