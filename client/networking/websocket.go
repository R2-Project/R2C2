package networking

import (
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type SecureWebSocket struct {
	Conn        *websocket.Conn
	mu          sync.Mutex
	IsConnected bool
}

func NewSecureWebSocket(conn *websocket.Conn) *SecureWebSocket {
	return &SecureWebSocket{
		Conn:        conn,
		IsConnected: true,
	}
}

func (s *SecureWebSocket) WriteJSON(v interface{}) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Write deadline to prevent hanging writes
	s.Conn.SetWriteDeadline(time.Now().Add(5 * time.Second))

	return s.Conn.WriteJSON(v)
}

func (s *SecureWebSocket) WriteMessage(messageType int, data []byte) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.Conn.SetWriteDeadline(time.Now().Add(5 * time.Second))
	return s.Conn.WriteMessage(messageType, data)
}

func (s *SecureWebSocket) Close() {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.IsConnected {
		s.Conn.Close()
		s.IsConnected = false
	}
}
