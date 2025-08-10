package listeners

import (
	"context"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"
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

// TODO: add listener to  db / state manager
func NewHttpListener(request NewHttpListenerRequest) *HttpListener {

	if request.Secure && request.Cert == nil {
		log.Fatal("Secure HTTP listener requires a certificate")
	}

	return &HttpListener{
		Id:              uuid.New().String(),
		Name:            request.Name,
		Host:            request.Host,
		Port:            request.Port,
		Secure:          request.Secure,
		Clients:         nil,
		LiveSince:       time.Now().Format(time.RFC3339),
		Status:          "running",
		Cert:            request.Cert,
		ResponseHeaders: request.ResponseHeaders,
		Uris:            request.Uris,
	}
}

func (h *HttpListener) Start() {
	port := strconv.Itoa(h.Port)

	mux := http.NewServeMux()
	mux.HandleFunc("/", h.handleRequest) // TODO: capture all endpoints

	h.server = &http.Server{
		Addr:    h.Host + ":" + port,
		Handler: mux,
	}

	if err := h.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("could not start HTTP listener %s: %v", h.Id, err)
	}

	log.Printf("HTTP listener %s ID: %s started on %s:%s", h.Name, h.Id, h.Host, port)
}

func (h *HttpListener) Stop() {

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := h.server.Shutdown(ctx); err != nil {
		log.Printf("could not stop HTTP listener %s: %v", h.Id, err)
	}
}

func (h *HttpListener) handleRequest(w http.ResponseWriter, r *http.Request) {
	// TODO:
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Hello from HttpListener " + h.Name))
}
