package models

type Curso struct {
    ID          string `json:"id"`
    Nombre      string `json:"nombre"`
    Descripcion string `json:"descripcion"`
    FechaInicio string `json:"fechaInicio"`
    FechaFin    string `json:"fechaFin"`
    Capacidad   int    `json:"capacidad"`
    Modalidad   string `json:"modalidad"` // presencial o virtual
}
