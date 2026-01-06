package ai

import "encoding/json"

type ToolDefinition struct {
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Parameters  json.RawMessage `json:"parameters"`
}

type ToolHandler func(args map[string]interface{}) (string, error)

type ToolRegistry struct {
	Definitions []ToolDefinition
	Handlers    map[string]ToolHandler
}

func NewRegistry() *ToolRegistry {
	return &ToolRegistry{
		Handlers: make(map[string]ToolHandler),
	}
}

func (r *ToolRegistry) Register(name, desc, schema string, handler ToolHandler) {
	r.Definitions = append(r.Definitions, ToolDefinition{
		Name:        name,
		Description: desc,
		Parameters:  json.RawMessage(schema),
	})
	r.Handlers[name] = handler
}
