package services

import (
    "encoding/csv"
    "fmt"
    "gobierno-inscripcion/models"
    "os"
    "strconv"
    "time"
)

var CursosDisponibles []models.Curso

func init() {
    // Cursos de ejemplo
    fecha1, _ := time.Parse("2006-01-02", "2025-06-01")
    fecha2, _ := time.Parse("2006-01-02", "2025-07-01")
    CursosDisponibles = []models.Curso{
        {
            ID:          1,
            Nombre:      "Introducción a React",
            Descripcion: "Curso básico de React para principiantes",
            FechaInicio: fecha1,
            FechaFin:    fecha1,
            DuracionMin: 120,
            Capacidad:   30,
            Lugar:       "Aula 1",
            Modalidad:   "presencial",
        },
        {
            ID:          2,
            Nombre:      "Backend con Go",
            Descripcion: "Aprende a crear APIs REST con Go y Gin",
            FechaInicio: fecha2,
            FechaFin:    fecha2,
            DuracionMin: 180,
            Capacidad:   25,
            Lugar:       "Aula 2",
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
        if len(record) < 9 {
            continue // línea incompleta
        }
        id, _ := strconv.ParseUint(record[0], 10, 64)
        fechaInicio, _ := time.Parse("2006-01-02", record[3])
        fechaFin, _ := time.Parse("2006-01-02", record[4])
        duracionMin := atoiSafe(record[5])
        capacidad := atoiSafe(record[6])
        curso := models.Curso{
            ID:          uint(id),
            Nombre:      record[1],
            Descripcion: record[2],
            FechaInicio: fechaInicio,
            FechaFin:    fechaFin,
            DuracionMin: duracionMin,
            Capacidad:   capacidad,
            Lugar:       record[7],
            Modalidad:   record[8],
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
