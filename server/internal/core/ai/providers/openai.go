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
	ai.RegisterProvider("openai", func(cfg ai.ProviderConfig) (ai.Provider, error) {
		return CreateOpenAIAdapter(), nil
	})
}

var systemPrompt = `
You are a Red Team Operator AI whose goal is to help a human operator perform security assessments and penetration tests on computer systems. You will assist the operator by providing suggestions, generating code snippets, and answering questions related to cybersecurity.
Your goal is to operate a C2 framework to manage agents, listeners, and tasks.
You will be capable of handle the following tools:
- get_listeners: List all active listeners, optionally filtered by type.
`

type AIAdapter struct {
	mu           sync.Mutex
	systemPrompt string
	config       *config.AIProviderConfig
}

func CreateOpenAIAdapter() *AIAdapter {
	return &AIAdapter{
		systemPrompt: systemPrompt,
	}
}

type openAiQueryRequest struct {
	Messages         []ai.Message `json:"messages"`
	MaxTokens        int          `json:"max_tokens"`
	Temperature      float64      `json:"temperature"`
	TopP             float64      `json:"top_p"`
	FrequencyPenalty float64      `json:"frequency_penalty"`
	PresencePenalty  float64      `json:"presence_penalty"`
}

type openAiChoice struct {
	Message ai.Message `json:"message"`
}

type openAiQueryResponse struct {
	Choices []openAiChoice `json:"choices"`
	Error   *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

func (adapter *AIAdapter) Name() string {
	return "openai"
}

func (adapter *AIAdapter) Query(ctx context.Context, messages []ai.Message, tools []ai.ToolDefinition) (*ai.Message, error) {

	if adapter.config == nil {
		adapter.config = &config.GetConfig().AIProvider
	}

	adapter.mu.Lock()
	defer adapter.mu.Unlock()

	data := openAiQueryRequest{
		Messages:         messages,
		MaxTokens:        2000,
		Temperature:      0.1,
		TopP:             0.95,
		FrequencyPenalty: 0.0,
		PresencePenalty:  0.0,
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

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response body: %w", err)
	}
	var queryResp openAiQueryResponse
	if err := json.Unmarshal(body, &queryResp); err != nil {
		return nil, fmt.Errorf("error unmarshaling response: %w", err)
	}

	if queryResp.Error != nil {
		return nil, fmt.Errorf("API returned an error: %s", queryResp.Error.Message)
	}

	if len(queryResp.Choices) == 0 {
		return nil, fmt.Errorf("no choices returned from API")
	}

	return &queryResp.Choices[0].Message, nil
}
