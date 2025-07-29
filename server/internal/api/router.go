package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func StartServer(host string, port int, protocol string) error {
	router := gin.New()

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	sport := strconv.Itoa(port)

	return router.Run(":" + sport)
}
