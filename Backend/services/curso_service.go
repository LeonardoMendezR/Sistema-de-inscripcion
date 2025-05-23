package services

import (
    "encoding/csv"
    "fmt"
    "os"
    "gobierno-inscripcion/models"
)

var CursosDisponibles []models.Curso

func init() {
    // Cursos de ejemplo
    CursosDisponibles = []models.Curso{
        {
            ID:          "1",
            Nombre:      "Introducción a React",
            Descripcion: "Curso básico de React para principiantes",
            FechaInicio: "2025-06-01",
            FechaFin:    "2025-06-20",
            Capacidad:   30,
            Modalidad:   "virtual",
        },
        {
            ID:          "2",
            Nombre:      "Backend con Go",
            Descripcion: "Aprende a crear APIs REST con Go y Gin",
            FechaInicio: "2025-07-01",
            FechaFin:    "2025-07-20",
            Capacidad:   25,
            Modalidad:   "presencial",
        },
    }
}

func CargarCursosDesdeCSV(path string) error {
    file, err := os.Open(path)
    if err != nil {
        return fmt.Errorf("error al abrir el archivo: %v", err)
    }
    defer file.Close()

    reader := csv.NewReader(file)
    reader.Comma = ';'
    records, err := reader.ReadAll()
    if err != nil {
        return fmt.Errorf("error al leer el CSV: %v", err)
    }

    var cursos []models.Curso
    for i, record := range records {
        if i == 0 {
            continue // Saltar encabezado
        }
        if len(record) < 7 {
            continue // línea incompleta
        }
        curso := models.Curso{
            ID:          record[0],
            Nombre:      record[1],
            Descripcion: record[2],
            FechaInicio: record[3],
            FechaFin:    record[4],
            Capacidad:   atoiSafe(record[5]),
            Modalidad:   record[6],
        }
        cursos = append(cursos, curso)
    }
    CursosDisponibles = cursos
    fmt.Printf("Cursos cargados: %+v\n", CursosDisponibles)
    return nil
}

func atoiSafe(s string) int {
    var n int
    fmt.Sscanf(s, "%d", &n)
    return n
}
