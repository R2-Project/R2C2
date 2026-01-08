package ai

import (
	"fmt"
	"sync"
)

type AIService struct {
	provider     Provider
	Registry     *ToolRegistry
	history      map[string][]Message
	historyMutex sync.RWMutex
}

func NewAIService(provider Provider) *AIService {
	service := &AIService{
		provider: provider,
		history:  make(map[string][]Message),
		Registry: NewRegistry(),
	}
	service.SetupTools()
	return service
}

func (s *AIService) SetupTools() {
	// Tool: Get listeners
	s.Registry.Register(
		"get_listeners",
		"List all active listeners, optionally filtered by type",
		`{
			"type": "object",
			"properties": {}
		}`,
		func(args map[string]interface{}) (string, error) {

			// TODO:

			listeners := []string{"listener1", "listener2"}

			return "Active listeners: " + fmt.Sprint(listeners), nil
		})
}
