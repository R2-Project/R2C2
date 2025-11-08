package api

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/mati-olivera/R2C2/internal/core/listeners"
)

func StartServer(port int) error {

	listenersService := listeners.NewListenersService()

	router := gin.New()

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

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	router.GET("/listeners", func(c *gin.Context) {

		listeners := listenersService.GetHttpListeners()

		c.JSON(http.StatusOK, gin.H{
			"message": "Current Listeners",
			"data":    listeners,
		})
	})

	router.POST("/listeners/http", func(c *gin.Context) {

		var data listeners.NewHttpListenerRequest
		if err := c.ShouldBindJSON(&data); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		listener := listeners.NewHttpListener(data)
		listenersService.AddHttpListener(listener)

		c.JSON(http.StatusCreated, gin.H{
			"message": "Listener Created",
			"data":    listener,
		})
	})

	sport := strconv.Itoa(port)

	return router.Run(":" + sport)
}
