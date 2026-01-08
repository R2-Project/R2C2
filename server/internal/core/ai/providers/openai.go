package providers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"

	"github.com/mati-olivera/R2C2/internal/config"
	"github.com/mati-olivera/R2C2/internal/core/ai"
)

func init() {
	ai.RegisterProvider("openai", func(cfg config.AIProviderConfig) (ai.Provider, error) {
		return CreateOpenAIAdapter(cfg), nil
	})
}

type AIAdapter struct {
	mu           sync.Mutex
	systemPrompt string
	config       *config.AIProviderConfig
}

func CreateOpenAIAdapter(cfg config.AIProviderConfig) *AIAdapter {
	return &AIAdapter{
		config:       &cfg,
		systemPrompt: ai.SystemPrompt,
	}
}

type toolWrapper struct {
	Type     string            `json:"type"`
	Function ai.ToolDefinition `json:"function"`
}

type openAiQueryRequest struct {
	Messages         []adapterMessage `json:"messages"`
	Tools            []toolWrapper    `json:"tools,omitempty"`
	ToolChoice       interface{}      `json:"tool_choice,omitempty"`
	MaxTokens        int              `json:"max_tokens"`
	Temperature      float64          `json:"temperature"`
	TopP             float64          `json:"top_p"`
	FrequencyPenalty float64          `json:"frequency_penalty"`
	PresencePenalty  float64          `json:"presence_penalty"`
}

type openAiChoice struct {
	Message      adapterMessage `json:"message"`
	FinishReason string         `json:"finish_reason"`
}

type openAiQueryResponse struct {
	Choices []openAiChoice `json:"choices"`
	Error   *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

type messageToolCall struct {
	ID       string          `json:"id"`
	Type     string          `json:"type"`
	Function adapterFunction `json:"function"`
}

type adapterFunction struct {
	Name      string `json:"name"`
	Arguments string `json:"arguments"`
}

type adapterMessage struct {
	Role       string                   `json:"role"`
	Content    string                   `json:"content,omitempty"`
	ToolCalls  []adapterMessageToolCall `json:"tool_calls,omitempty"`
	ToolCallID string                   `json:"tool_call_id,omitempty"`
}

type adapterMessageToolCall struct {
	ID       string          `json:"id"`
	Type     string          `json:"type"`
	Function adapterFunction `json:"function"`
}

func (adapter *AIAdapter) Name() string {
	return "openai"
}

func (adapter *AIAdapter) Query(ctx context.Context, messages []ai.Message, tools []ai.ToolDefinition) (*ai.Message, error) {

	adapter.mu.Lock()
	defer adapter.mu.Unlock()

	var adapterHistory []adapterMessage
	for _, m := range messages {
		azMsg := adapterMessage{
			Role:       m.Role,
			Content:    m.Content,
			ToolCallID: m.ToolCallID,
		}

		if len(m.ToolCalls) > 0 {
			var azToolCalls []adapterMessageToolCall
			for _, tc := range m.ToolCalls {
				azToolCalls = append(azToolCalls, adapterMessageToolCall{
					ID:   tc.ID,
					Type: "function",
					Function: adapterFunction{
						Name:      tc.Name,
						Arguments: tc.Args,
					},
				})
			}
			azMsg.ToolCalls = azToolCalls
		}

		adapterHistory = append(adapterHistory, azMsg)
	}

	var parsedTools []toolWrapper
	if len(tools) > 0 {
		for _, t := range tools {
			parsedTools = append(parsedTools, toolWrapper{
				Type:     "function",
				Function: t,
			})
		}
	}

	data := openAiQueryRequest{
		Messages:         adapterHistory,
		Tools:            parsedTools,
		MaxTokens:        2000,
		Temperature:      0.1,
		TopP:             0.95,
		FrequencyPenalty: 0.0,
		PresencePenalty:  0.0,
	}

	if len(parsedTools) > 0 {
		data.ToolChoice = "auto"
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, fmt.Errorf("Error marshaling JSON: %v", err)
	}

	req, err := http.NewRequest("POST", adapter.config.BaseURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("error creating request: %w", err)
	}

	q := req.URL.Query()
	q.Add("api-version", adapter.config.APIVersion)
	q.Add("api-key", adapter.config.APIKey)

	req.URL.RawQuery = q.Encode()

	client := &http.Client{
		// for long responses
		Timeout: 2 * time.Minute,
	}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error sending request: %w", err)
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code %d: ", resp.StatusCode, string(body))
	}

	var queryResp openAiQueryResponse
	err = json.Unmarshal(body, &queryResp)
	if err != nil {
		return nil, fmt.Errorf("error unmarshaling response JSON: %w", err)
	}

	if queryResp.Error != nil {
		return nil, fmt.Errorf("API returned an error: %s", queryResp.Error.Message)
	}

	if len(queryResp.Choices) == 0 {
		return nil, fmt.Errorf("no choices returned from API")
	}

	azMsg := queryResp.Choices[0].Message

	genericMsg := &ai.Message{
		Role:    azMsg.Role,
		Content: azMsg.Content,
	}

	if len(azMsg.ToolCalls) > 0 {
		var genericToolCalls []ai.ToolCall
		for _, azTc := range azMsg.ToolCalls {
			genericToolCalls = append(genericToolCalls, ai.ToolCall{
				ID:   azTc.ID,
				Name: azTc.Function.Name,
				Args: azTc.Function.Arguments,
			})
		}
		genericMsg.ToolCalls = genericToolCalls
	}

	return genericMsg, nil
}
