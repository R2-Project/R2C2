package api

import (
	"fmt"
	"sync"

	"github.com/mati-olivera/R2C2/internal/core/logger"
)

type Hub struct {
	clients    map[*Client]bool
	Broadcast  chan []byte
	Register   chan *Client
	unregister chan *Client
	mutex      sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		Broadcast:  make(chan []byte),
		Register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.clients[client] = true
			logger.Info(fmt.Sprintf("Operator %s has joined", client.Username))

		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				logger.Info(fmt.Sprintf("Operator %s has left", client.Username))
				delete(h.clients, client)
				close(client.Send)
			}

		case message := <-h.Broadcast:
			for client := range h.clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(h.clients, client)
				}
			}
		}
	}
}

type LogAdapter struct {
	Hub *Hub
}

func (w *LogAdapter) Write(p []byte) (n int, err error) {

	msg := make([]byte, len(p))
	copy(msg, p)

	w.Hub.Broadcast <- msg
	return len(p), nil
}
