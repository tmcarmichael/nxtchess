package controllers

import (
	"net/http"
)

func HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("OK"))
}
