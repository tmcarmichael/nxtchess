package metrics

import (
	"time"

	"github.com/prometheus/client_golang/prometheus"
)

var (
	HTTPRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total HTTP requests by method, route, status",
		},
		[]string{"method", "route", "status"},
	)
	HTTPRequestDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "HTTP request latency distribution",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "route"},
	)
	WSConnectionsActive = prometheus.NewGauge(prometheus.GaugeOpts{
		Name: "ws_connections_active",
		Help: "Active WebSocket connections",
	})
	WSGamesActive = prometheus.NewGauge(prometheus.GaugeOpts{
		Name: "ws_games_active",
		Help: "Active multiplayer games",
	})
	DBQueryDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "db_query_duration_seconds",
			Help:    "Database query latency",
			Buckets: []float64{.001, .005, .01, .025, .05, .1, .25, .5, 1},
		},
		[]string{"operation"},
	)
)

func Register() {
	prometheus.MustRegister(HTTPRequestsTotal, HTTPRequestDuration,
		WSConnectionsActive, WSGamesActive, DBQueryDuration)
}

func ObserveQuery(operation string, start time.Time) {
	DBQueryDuration.WithLabelValues(operation).Observe(time.Since(start).Seconds())
}
