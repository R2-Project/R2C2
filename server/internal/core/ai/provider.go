package ai

import (
	"context"
	"log"
	"sync"
)

var (
	mu        sync.RWMutex
	factories = make(map[string]Factory)
)

type Message struct {
	Role      string     `json:"role"` // "system", "user", "assistant", "tool"
	Content   string     `json:"content"`
	ToolCalls []ToolCall `json:"tool_calls,omitempty"`
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

type ProviderConfig map[string]string
type Factory func(cfg ProviderConfig) (Provider, error)

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
