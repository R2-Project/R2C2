package agents

import "testing"

func TestBuildAgent(t *testing.T) {
	agent := &Agent{
		Id:        "test-id",
		Name:      "test-agent",
		Listener:  "test-listener",
		Status:    "inactive",
		Arch:      "x86_64",
		Format:    ".exe",
		Timestamp: 1234567890,
	}

	binaryPath, err := agent.Build()
	if err != nil {
		t.Fatalf("Failed to build agent: %v", err)
	}

	if binaryPath == nil || *binaryPath == "" {
		t.Fatalf("Expected a valid binary path, got empty")
	}
}
