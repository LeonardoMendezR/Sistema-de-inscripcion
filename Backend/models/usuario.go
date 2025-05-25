package models

type Usuario struct {
	ID           uint   `gorm:"primaryKey"`
	Usuario      string `gorm:"unique;not null"`
	PasswordHash string `gorm:"not null"`
	Rol          string `gorm:"not null;check:rol IN ('admin','operador')"`
}
