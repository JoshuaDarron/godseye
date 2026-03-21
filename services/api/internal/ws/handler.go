package ws

import (
	"context"
	"log/slog"
	"net/http"

	"github.com/joshuaferrara/godseye/services/api/internal/broadcast"
	"github.com/joshuaferrara/godseye/services/api/internal/middleware"
	"nhooyr.io/websocket"
)

// Handler returns an http.HandlerFunc that upgrades connections to WebSocket,
// registers them with the Broadcaster, and starts read/write pumps.
//
// If a "token" query parameter is present and contains a valid JWT, the
// authenticated user's ID is attached to the Client. If absent or invalid,
// the connection is still accepted (anonymous).
func Handler(b *broadcast.Broadcaster, jwtSecret string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
			InsecureSkipVerify: true, // Allow connections from any origin during development.
		})
		if err != nil {
			slog.Error("websocket accept failed", "error", err)
			return
		}

		client := broadcast.NewClient(conn, b)

		// Optional: read token query param and attach user info.
		if tokenStr := r.URL.Query().Get("token"); tokenStr != "" && jwtSecret != "" {
			claims := middleware.GetUserClaimsFromToken(jwtSecret, tokenStr)
			if claims != nil {
				client.UserID = claims.UserID
				slog.Debug("websocket authenticated", "user_id", claims.UserID)
			}
		}

		b.Register(client)

		ctx := r.Context()

		// Derive a cancellable context so either pump can trigger cleanup.
		pumpCtx, cancel := context.WithCancel(ctx)

		go func() {
			defer cancel()
			client.WritePump(pumpCtx)
		}()

		// ReadPump blocks until the client disconnects.
		client.ReadPump(pumpCtx)
		cancel()
	}
}
