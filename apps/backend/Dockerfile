FROM golang:1.21-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o /server cmd/server/main.go

FROM alpine:latest
WORKDIR /app
COPY --from=build /server /app/server
EXPOSE 8080
CMD ["/app/server"]