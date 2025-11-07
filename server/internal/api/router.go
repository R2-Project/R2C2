package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/mati-olivera/R2C2/internal/core/listeners"
)

func StartServer(port int) error {

	router := gin.New()

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
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

		c.JSON(http.StatusCreated, gin.H{
			"message": "Listener Created",
			"data":    listener,
		})
	})

	sport := strconv.Itoa(port)

	return router.Run(":" + sport)
}
