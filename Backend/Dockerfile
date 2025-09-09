# --- Etapa 1: Compilación ---
# Usamos una etiqueta más genérica para obtener siempre los últimos parches de seguridad de Go 1.24
FROM golang:1.24-alpine AS builder

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de dependencias primero para aprovechar la caché de Docker
COPY go.mod go.sum ./
# Descargamos las dependencias
RUN go mod download

# Copiamos el resto del código fuente del backend
COPY . .

# Compilamos la aplicación con flags para un binario estático, ideal para Alpine.
# CGO_ENABLED=0 es importante para evitar dependencias con 'glibc' de otras distros.
RUN CGO_ENABLED=0 go build -o backend ./cmd

# --- Etapa 2: Imagen Final ---
# Usamos una imagen base de Alpine, que es muy ligera y tiene menos vulnerabilidades
FROM alpine:latest

# Es buena práctica actualizar los paquetes a sus últimas versiones para parches de seguridad
RUN apk --no-cache update && apk --no-cache upgrade

WORKDIR /app

# Instalar cliente MySQL, ca-certificates y dos2unix para corregir finales de línea de Windows.
RUN apk --no-cache add mysql-client ca-certificates dos2unix

# Copiamos únicamente el binario compilado de la etapa 'builder'
COPY --from=builder /app/backend /app/backend

# Copiamos el script de espera
COPY wait-for-mysql.sh /app/wait-for-mysql.sh
# Corregimos los finales de línea (de CRLF a LF) y damos permisos de ejecución.
RUN dos2unix /app/wait-for-mysql.sh && chmod +x /app/wait-for-mysql.sh

# Exponemos el puerto que usará la aplicación
EXPOSE 8080

# Definimos el comando por defecto para iniciar el contenedor.
# Docker Compose lo sobrescribirá para usar el script de espera.
CMD ["/app/backend"]

