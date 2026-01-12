package ai

import (
	"encoding/json"
	"fmt"
	"sync"

	"github.com/mati-olivera/R2C2/internal/core/listeners"
)

type AIService struct {
	provider         Provider
	Tools            *ToolRegistry
	history          map[string][]Message
	historyMutex     sync.RWMutex
	listenersService listeners.ListenersService
}

func NewAIService(provider Provider, listenersService listeners.ListenersService) *AIService {
	service := &AIService{
		provider:         provider,
		history:          make(map[string][]Message),
		Tools:            NewToolRegistry(),
		listenersService: listenersService,
	}
	service.SetupTools()
	return service
}

func (s *AIService) SetupTools() {
	// Tool: Get listeners
	s.Tools.Register(
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

	//  Tool: UI Navigatio
	s.Tools.Register(
		"ui_navigate",
		"Opens a specific tab or page in the operator's dashboard. Use this when the user asks to 'see', 'show', or 'go to' a specific view.",
		`{
		"type": "object",
		"properties": {
		"view": {
		"type": "string",
		"enum": ["listeners", "sessions", "tasks", "chat"],
		"description": "The internal name of the view to open"
		}
		},
		"required": ["view"]
		}`,
		func(args map[string]interface{}) (string, error) {

			// TODO: broacast ui navigation event
			// eventHub.Broadcast("ui_navigation", gin.H{
			// 	"view": args.View,
			//	"user_id": operatorId, ??
			// })

			return fmt.Sprintf("Success: Navigation signal sent for view '%s'", args["view"]), nil
		})
}
