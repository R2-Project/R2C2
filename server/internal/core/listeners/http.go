package listeners

import (
	"context"
	"errors"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"
	"encoding/json"

	"github.com/mati-olivera/R2C2/internal/core/logger"
	"github.com/mati-olivera/R2C2/internal/core/tasks"
)

type HttpListener struct {
	Id              string    `json:"id"`
	Name            string    `json:"name"`
	Port            int       `json:"port"`
	Host            string    `json:"host"` // Optional, can be empty for all interfaces
	Secure          bool      `json:"secure"`
	Clients         *[]string `json:"clients"`
	LiveSince       string    `json:"live_since"`
	Status          string    `json:"status"`
	Cert            *Cert     `json:"cert,omitempty"` // Optional, only if Secure is true
	ResponseHeaders []string  `json:"response_headers,omitempty"`
	Uris            []string  `json:"uris"` // las que va a usar el implante para ciclar peticiones
	server          *http.Server
	mu              sync.Mutex
	TaskManager     *tasks.TaskManager `json:"-"`
}

type Cert struct {
	CertFile string `json:"cert_file"`
	Key      string `json:"key"`
}

type NewHttpListenerRequest struct {
	Name            string   `json:"name"`
	Host            string   `json:"host"`
	Port            int      `json:"port"`
	Secure          bool     `json:"secure"`
	Cert            *Cert    `json:"cert,omitempty"` // Optional, only if Secure is true
	ResponseHeaders []string `json:"response_headers,omitempty"`
	Uris            []string `json:"uris"` // las que va a usar el implante para ciclar peticiones
}

func (h *HttpListener) Start() error {
	h.mu.Lock()
	defer h.mu.Unlock()

	if h.Status == "running" {
		return errors.New("listener is already running")
	}

	port := strconv.Itoa(h.Port)

	mux := http.NewServeMux()
	mux.HandleFunc("/", h.handleRequest) // TODO: capture all endpoints

	h.server = &http.Server{
		Addr:    h.Host + ":" + port,
		Handler: mux,
	}

	h.Status = "running"

	go func() {
		logger.Info("Starting HTTP listener", "listener_id", h.Id, "host", h.Host, "port", port)
		if err := h.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("HTTP Listener Error: %v\n", err)
		}

		h.mu.Lock()
		h.Status = "stopped"
		h.mu.Unlock()
	}()

	log.Printf("HTTP listener %s ID: %s started on %s:%s", h.Name, h.Id, h.Host, port)
	return nil
}

func (h *HttpListener) Stop() {
	h.mu.Lock()
	defer h.mu.Unlock()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := h.server.Shutdown(ctx); err != nil {
		logger.Error("could not stop HTTP listener", err, "listener_id", h.Id)
		return
	}
	logger.Info("Stopped HTTP listener", "listener_id", h.Id)
}

func (h *HttpListener) handleRequest(w http.ResponseWriter, r *http.Request) {
	agentId := r.Header.Get("X-Agent-ID")
	if agentId == "" {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Missing X-Agent-ID header"))
		return
	}

	tasks, err := h.TaskManager.FetchTasks(agentId)
	if err != nil {
		logger.Error("Error fetching tasks", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if tasks == nil || len(*tasks) == 0 {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}

func (h *HttpListener) IsRunning() bool {
	h.mu.Lock()
	defer h.mu.Unlock()
	return h.Status == "running"
}
