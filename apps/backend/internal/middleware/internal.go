package middleware

import (
	"net/http"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/httpx"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
)

// InternalOnly restricts access to requests from private networks or configured trusted proxies.
func InternalOnly(cfg *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if httpx.IsPrivateIP(r.RemoteAddr) {
				next.ServeHTTP(w, r)
				return
			}

			remoteIP := httpx.ExtractIP(r.RemoteAddr)
			if cfg != nil && httpx.IsTrustedProxy(remoteIP, cfg.TrustedProxies) {
				next.ServeHTTP(w, r)
				return
			}

			logger.Warn("InternalOnly: access denied", logger.F("remoteAddr", remoteIP, "path", r.URL.Path))
			httpx.WriteJSONError(w, http.StatusForbidden, "Forbidden")
		})
	}
}
