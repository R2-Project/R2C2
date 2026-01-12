package ai

import "encoding/json"

type ToolDefinition struct {
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Parameters  json.RawMessage `json:"parameters"`
}

type ToolHandler func(args map[string]interface{}) (string, error)

type ToolRegistry struct {
	definitions []ToolDefinition
	Handlers    map[string]ToolHandler
}

func NewToolRegistry() *ToolRegistry {
	return &ToolRegistry{
		Handlers: make(map[string]ToolHandler),
	}
}

func (r *ToolRegistry) Register(name, desc, schema string, handler ToolHandler) {
	r.definitions = append(r.definitions, ToolDefinition{
		Name:        name,
		Description: desc,
		Parameters:  json.RawMessage(schema),
	})
	r.Handlers[name] = handler
}

func (r *ToolRegistry) GetDefinitions() []ToolDefinition {
	return r.definitions
}

func (r *ToolRegistry) Execute(name, argsStr string) (string, error) {
	handler, exists := r.Handlers[name]
	if !exists {
		return "", nil
	}

	var args map[string]interface{}
	if err := json.Unmarshal([]byte(argsStr), &args); err != nil {
		return "", err
	}

	return handler(args)
}
