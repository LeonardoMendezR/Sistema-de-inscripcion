-- Script de creación de base de datos para inscripciones a cursos (MySQL)

-- Tabla: cursos
CREATE TABLE IF NOT EXISTS cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    lugar VARCHAR(255),
    capacidad INT NOT NULL CHECK (capacidad > 0)
);

-- Tabla: personas (alumnos)
CREATE TABLE IF NOT EXISTS personas (
    cuil VARCHAR(11) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(30)
);

-- Tabla: inscripciones
CREATE TABLE IF NOT EXISTS inscripciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    curso_id INT NOT NULL,
    cuil VARCHAR(11) NOT NULL,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_curso_cuil (curso_id, cuil),
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
    FOREIGN KEY (cuil) REFERENCES personas(cuil) ON DELETE CASCADE
);

-- Índices para mejorar búsquedas en inscripciones
CREATE INDEX idx_inscripciones_curso_id ON inscripciones(curso_id);
CREATE INDEX idx_inscripciones_cuil ON inscripciones(cuil);

-- (Opcional) Tabla: usuarios (admin/operador)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'operador') NOT NULL
);

-- Datos de prueba

-- Insertar cursos de prueba
INSERT IGNORE INTO cursos (id, nombre, fecha_inicio, fecha_fin, lugar, capacidad)
VALUES
  (1, 'Curso de Node.js', '2025-06-01', '2025-06-10', 'Aula 1', 30),
  (2, 'Curso de Python', '2025-07-01', '2025-07-05', 'Aula 2', 25);

-- Insertar una persona (alumno)
INSERT IGNORE INTO personas (cuil, nombre, apellido, email, telefono)
VALUES ('20123456789', 'Juan', 'Pérez', 'juan.perez@email.com', '1122334455');

-- Inscribir a la persona en un curso
INSERT IGNORE INTO inscripciones (curso_id, cuil)
VALUES (1, '20123456789');

-- Consulta ejemplo para exportar inscripciones
-- SELECT i.id, p.cuil, p.nombre, p.apellido, c.nombre AS curso, i.fecha_inscripcion
-- FROM inscripciones i
-- JOIN personas p ON i.cuil = p.cuil
-- JOIN cursos c ON i.curso_id = c.id;
