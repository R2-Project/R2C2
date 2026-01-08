package ai

import "testing"

func TestChat(t *testing.T) {
	aiService := NewAIService()

	operatorId := "anakin"
	message := "Hello R2C2"

	_, err := aiService.Chat(operatorId, message)
	if err != nil {
		t.Errorf("Chat returned an error: %v", err)
	}
}
