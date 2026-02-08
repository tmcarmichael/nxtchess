# Production Dockerfile for Go backend (build from project root)
# Multi-stage build for smaller image
# Usage: docker build -f backend.Dockerfile -t nxtchess-backend .

# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install git for go mod download (some deps may need it)
RUN apk add --no-cache git

# Download dependencies first (cached layer)
COPY apps/backend/go.mod apps/backend/go.sum ./
RUN go mod download

# Copy source and build
COPY apps/backend/ .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server cmd/server/main.go

# Runtime stage
FROM alpine:3.19

WORKDIR /app

# Install CA certificates for HTTPS calls (OAuth)
RUN apk --no-cache add ca-certificates tzdata

# Copy binary from builder (migrations are embedded via go:embed)
COPY --from=builder /app/server .

# Run as non-root user
RUN adduser -D -g '' appuser
USER appuser

EXPOSE 8080

CMD ["./server"]
