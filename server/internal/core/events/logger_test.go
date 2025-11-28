package events

import (
	"errors"
	"fmt"
	"testing"
)

func TestInfo(t *testing.T) {
	Info("testing info", "key", "value")
	Info("testing info", "key")
}

func TestError(t *testing.T) {
	err := errors.New("timon")
	Error("testing error", fmt.Errorf("pumba: %w", err))
}
