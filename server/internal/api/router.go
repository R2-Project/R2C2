package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func StartServer(port int) error {

	router := gin.New()

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	sport := strconv.Itoa(port)

	return router.Run(":" + sport)
}
