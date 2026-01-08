package ai

import (
	"context"
	"fmt"
	"log"
	"sync"

	"github.com/mati-olivera/R2C2/internal/config"
)

var (
	mu        sync.RWMutex
	factories = make(map[string]Factory)
)

type QueryRequest struct {
	Message string `json:"message"`
}

type Message struct {
	Role       string     `json:"role"` // "system", "user", "assistant", "tool"
	Content    string     `json:"content"`
	ToolCalls  []ToolCall `json:"tool_calls,omitempty"`
	ToolCallID string     `json:"tool_call_id,omitempty"`
}

type ToolCall struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Args string `json:"arguments"` // JSON string
}

type Provider interface {
	Name() string
	Query(ctx context.Context, messages []Message, tools []ToolDefinition) (*Message, error)
}

type Factory func(cfg config.AIProviderConfig) (Provider, error)

func RegisterProvider(name string, factory Factory) {
	mu.Lock()
	defer mu.Unlock()
	if factory == nil {
		log.Fatal("ai: Register factory is nil")
	}
	if _, dup := factories[name]; dup {
		log.Fatal("ai: Register called twice for provider " + name)
	}
	factories[name] = factory
}

func NewProvider(cfg config.AIProviderConfig) (Provider, error) {
	mu.RLock()
	factory, ok := factories[cfg.Provider]
	mu.RUnlock()

	if !ok {
		return nil, fmt.Errorf("ai: unknown provider '%s' (did you import it?)", cfg.Provider)
	}
	return factory(cfg)
}
