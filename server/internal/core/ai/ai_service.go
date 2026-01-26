package ai

import (
	"encoding/json"
	"fmt"
	"strings"
	"sync"

	"github.com/mati-olivera/R2C2/internal/core/agents"
	"github.com/mati-olivera/R2C2/internal/core/broadcaster"
	"github.com/mati-olivera/R2C2/internal/core/listeners"
	"github.com/mati-olivera/R2C2/internal/core/logger"
	"github.com/mati-olivera/R2C2/internal/core/tasks"
)

type AIService struct {
	provider         Provider
	Tools            *ToolRegistry
	history          map[string][]Message
	historyMutex     sync.RWMutex
	listenersService listeners.ListenersService
	taskManager      tasks.TaskManager
	sessions         agents.SessionsService
}

func NewAIService(provider Provider, listenersService listeners.ListenersService, taskManager tasks.TaskManager, sessions agents.SessionsService) *AIService {
	service := &AIService{
		provider:         provider,
		history:          make(map[string][]Message),
		Tools:            NewToolRegistry(),
		listenersService: listenersService,
		taskManager:      taskManager,
		sessions:         sessions,
	}
	service.SetupTools()
	return service
}

func (s *AIService) SetupTools() {

	var commandNames []string
	var commandDescriptions []string

	for _, cmd := range *s.taskManager.GetAvailableCommands() {
		commandNames = append(commandNames, fmt.Sprintf(`"%s"`, cmd.Name))
		commandDescriptions = append(commandDescriptions, fmt.Sprintf("%s: %s", cmd.Name, cmd.Usage))
	}

	enumList := strings.Join(commandNames, ", ")
	usageList := strings.Join(commandDescriptions, "; ")
	taskSchema := fmt.Sprintf(`{
        "type": "object",
        "properties": {
            "agent_id": {
                "type": "string",
                "description": "The target beacon UUID"
            },
            "command": {
                "type": "string",
                "enum": [%s],
                "description": "The command to execute."
            },
            "args": {
                "type": "string",
                "description": "Arguments for the command. Rules: [%s]"
            }
        },
        "required": ["agent_id", "command"]
	}`, enumList, usageList)

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

	s.Tools.Register(
		"create_listener",
		"Create a new HTTP listener",
		`{
			"type": "object",
			"properties": {
				"name": { "type": "string", "description": "Name of the listener" },
				"host": { "type": "string", "description": "Host/IP to bind the listener" },
				"port": { "type": "integer", "description": "Port number for the listener" },
				"secure": { "type": "boolean", "description": "Whether the listener should use HTTPS" },
				"cert": {
					"type": "object",
					"properties": {
						"cert_file": { "type": "string", "description": "Path to the certificate file" },
						"key": { "type": "string", "description": "Path to the key file" }
					},
					"description": "Certificate details for HTTPS listener"
				},
				"response_headers": {
					"type": "array",
					"items": { "type": "string" },
					"description": "Custom response headers for the listener"
				},
				"uris": {
					"type": "array",
					"items": { "type": "string" },
					"description": "URIs that the implant will use to cycle requests"
				}
			},
		        "required": ["name", "host", "port", "secure"]
		}`,
		func(args map[string]interface{}) (string, error) {

			request := listeners.NewHttpListenerRequest{
				Name:            args["name"].(string),
				Host:            args["host"].(string),
				Port:            int(args["port"].(float64)),
				Secure:          args["secure"].(bool),
				ResponseHeaders: []string{},
				Uris:            []string{},
			}

			listener, err := s.listenersService.CreateHttpListener(request)
			result, err := json.Marshal(listener)
			if err != nil {
				return "", err
			}

			return string(result), nil
		})

	//  Tool: UI Navigation
	s.Tools.Register(
		"ui_navigate",
		"Opens a specific tab or page in the operator's dashboard. Use this when the user asks to 'see', 'show', or 'go to' a specific view.",
		`{
			"type": "object",
			"properties": {
				"view": {
					"type": "string",
					"enum": ["listeners", "sessions", "session", "chat", "network"],
					"description": "The internal name of the view to open"
				},
				"agent_id": {
					"type": "string",
					"description": "The target beacon UUID (required if view is 'session')"
				}
			},
			"required": ["view"]
		}`,
		func(args map[string]interface{}) (string, error) {
			var agentId string
			if args["view"] == "session" {
				if args["agent_id"] == nil {
					return "", fmt.Errorf("agent_id is required when view is 'session'")
				}
				agentId = args["agent_id"].(string)
			}

			data := broadcaster.UINavigateEvent{
				View:    args["view"].(string),
				AgentId: agentId,
			}

			payload, err := json.Marshal(data)
			if err != nil {
				return "", err
			}

			broadcaster.BroadcastEvent(broadcaster.UI_NAVIGATE_EVENT, string(payload))

			return fmt.Sprintf("Success: Navigation signal sent for view '%s'", args["view"]), nil
		})

	s.Tools.Register(
		"issue_task",
		"Issue a task to a specific session",
		taskSchema,
		func(args map[string]interface{}) (string, error) {

			agentId := args["agent_id"].(string)
			command := args["command"].(string)
			var cmdArgs []string

			if val, ok := args["args"]; ok && val != nil {
				switch v := val.(type) {
				case []interface{}:
					for _, arg := range v {
						if s, ok := arg.(string); ok {
							cmdArgs = append(cmdArgs, s)
						}
					}
				case string:
					cmdArgs = append(cmdArgs, v)
				default:
					logger.Error("AI tool unexpected type for args", nil, fmt.Sprintf("%T", val))
				}
			}

			result, err := s.taskManager.Queue(agentId, command, cmdArgs)
			if err != nil {
				logger.Error("AI tool issue_task error", err, "agent_id", agentId, "command", command)
				return "", err
			}

			resultData, err := json.Marshal(result)
			if err != nil {
				return "", err
			}

			return string(resultData), nil
		})

	s.Tools.Register(
		"get_sessions",
		"List all active sessions",
		`{
			"type": "object",
			"properties": {}
		}`,
		func(args map[string]interface{}) (string, error) {

			sessions, err := s.sessions.GetSessions()
			if err != nil {
				return "", err
			}
			result, err := json.Marshal(sessions)
			if err != nil {
				return "", err
			}

			return string(result), nil
		})

}
