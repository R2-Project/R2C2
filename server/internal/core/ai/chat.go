package ai

func (s *AIService) Chat(userMessage string) (string, error) {

	// TODO: handle history by operator and tool calls

	// messages := []Message{
	// 	{Role: "user", Content: userMessage},
	// }
	//
	// Limit loop to prevent infinite recursion
	// for i := 0; i < 5; i++ {
	// 	// 2. Call LLM Provider (OpenAI/Anthropic)
	// 	// Pass 'messages' AND 's.Registry.Definitions'
	// 	response, err := s.provider.Query(context.Background(), s.Registry.Definitions)
	// 	if err != nil {
	// 		return "", err
	// 	}
	//
	// 	// 3. Check: Did the AI want to call a tool?
	// 	if response.ToolCall == nil {
	// 		// No tool call, just text. We are done.
	// 		return response.Content, nil
	// 	}
	//
	// 	// 4. Execute the Tool
	// 	toolName := response.ToolCall.Name
	// 	toolArgs := response.ToolCall.Arguments // Map
	//
	// 	handler, exists := s.Registry.Handlers[toolName]
	// 	if !exists {
	// 		messages = append(messages, Message{Role: "tool", Content: "Error: Tool not found"})
	// 		continue
	// 	}
	//
	// 	// Run the C2 function!
	// 	result, _ := handler(toolArgs)
	//
	// 	// 5. Add Result to History
	// 	// The AI needs to see the result to know what to do next
	// 	messages = append(messages, Message{
	// 		Role:     "assistant",
	// 		ToolCall: response.ToolCall, // Log that it tried to call
	// 	})
	// 	messages = append(messages, Message{
	// 		Role:    "tool",
	// 		Content: result, // The output of the function
	// 	})
	//
	// 	// Loop runs again... LLM sees the result and generates the next step.
	// }

	return "Agent loop limit reached", nil
}
