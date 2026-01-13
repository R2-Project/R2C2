package ai

import (
	"context"
	"fmt"
)

func (s *AIService) Chat(ctx context.Context, operatorId string, userMessage string) (string, error) {

	s.historyMutex.Lock()
	if _, exists := s.history[operatorId]; !exists {
		s.history[operatorId] = []Message{
			{Role: "system", Content: SystemPrompt},
		}
	}
	messages := s.history[operatorId]
	s.historyMutex.Unlock()

	messages = append(messages, Message{
		Role:    "user",
		Content: userMessage,
	})

	finalResponse := ""

	// limit infinite recursion
	for i := 0; i < 5; i++ {
		tools := s.Tools.GetDefinitions()

		resp, err := s.provider.Query(ctx, messages, tools)
		if err != nil {
			return "", fmt.Errorf("AI provider error: %w", err)
		}

		messages = append(messages, *resp)

		if len(resp.ToolCalls) == 0 {
			// if no tools called we assume final answer
			finalResponse = resp.Content
			break
		}

		for _, toolCall := range resp.ToolCalls {
			fmt.Printf("[AI] Calling Tool: %s args: %s\n", toolCall.Name, toolCall.Args)

			resultStr, err := s.Tools.Execute(toolCall.Name, toolCall.Args)
			if err != nil {
				resultStr = fmt.Sprintf("Error executing tool: %v", err)
			}

			messages = append(messages, Message{
				Role:       "tool",
				Content:    resultStr,
				ToolCallID: toolCall.ID, // Matches the ID from the assistant's request
			})
		}
	}

	s.historyMutex.Lock()
	s.history[operatorId] = messages
	s.historyMutex.Unlock()

	return finalResponse, nil
}
