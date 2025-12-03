package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mati-olivera/R2C2/internal/core/auth"
)

func WebSocketAuth(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.Query("token")

		if tokenString == "" {
			tokenString = c.GetHeader("Authorization")
		}

		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		claims, err := auth.ValidateToken(tokenString, jwtSecret)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		c.Set("operator_id", claims.OperatorID)
		c.Set("username", claims.Username)

		c.Next()
	}
}
