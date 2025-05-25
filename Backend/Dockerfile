# syntax=docker/dockerfile:1
# Dockerfile para Backend Go + MySQL
FROM golang:1.24.3-alpine AS build
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o backend ./cmd/main.go

FROM alpine:3.19
WORKDIR /app
RUN apk add --no-cache curl
COPY --from=build /app/backend /app/backend
COPY db_schema.sql /app/db_schema.sql
COPY .env .env
COPY wait-for-mysql.sh /app/wait-for-mysql.sh
RUN chmod +x /app/wait-for-mysql.sh
EXPOSE 8080
CMD ["/app/wait-for-mysql.sh", "mysql", "/app/backend"]
