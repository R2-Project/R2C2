package auth

import (
	"os"
	"testing"
)

func TestValidateToken(t *testing.T) {
	claims, err := ValidateToken(os.Getenv("AUTH_TOKEN"), os.Getenv("AUTH_SECRET"))
	if err != nil {
		t.Error("Failed to validate token:", err)
	}

	if claims.OperatorID == "" {
		t.Error("OperatorID is empty in claims")
	}
}
