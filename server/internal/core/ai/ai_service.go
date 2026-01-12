package ai

import (
	"encoding/json"
	"sync"

	"github.com/mati-olivera/R2C2/internal/core/listeners"
)

type AIService struct {
	provider         Provider
	Registry         *ToolRegistry
	history          map[string][]Message
	historyMutex     sync.RWMutex
	listenersService listeners.ListenersService
}

func NewAIService(provider Provider, listenersService listeners.ListenersService) *AIService {
	service := &AIService{
		provider:         provider,
		history:          make(map[string][]Message),
		Registry:         NewRegistry(),
		listenersService: listenersService,
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

			listeners := s.listenersService.GetListeners()
			result, err := json.Marshal(listeners)
			if err != nil {
				return "", err
			}

			return string(result), nil
		})
}
