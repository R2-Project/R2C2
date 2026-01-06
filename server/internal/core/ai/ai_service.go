package ai

type AIService struct {
	provider Provider
	Registry *ToolRegistry
}

func NewAIService() *AIService {
	return &AIService{
		Registry: NewRegistry(),
	}
}

func (s *AIService) SetupTools() {
	// Tool: Get Agents
	// s.Registry.Register(
	// 	"get_agents",
	// 	"List all active agents, optionally filtered by platform",
	// 	`{
	// 	"type": "object",
	// 	"properties": {
	// 	"platform": {"type": "string", "enum": ["windows", "linux", "darwin"]}
	// 	}
	// 	}`,
	// 	func(args map[string]interface{}) (string, error) {
	// 		// Call your actual SessionService
	// 		platform, _ := args["platform"].(string)
	// 		agents := s.sessionService.ListAgents(platform)
	//
	// 		// Return JSON string of agents
	// 		data, _ := json.Marshal(agents)
	// 		return string(data), nil
	// 	},
	// )

	// Tool: Get listeners
}
