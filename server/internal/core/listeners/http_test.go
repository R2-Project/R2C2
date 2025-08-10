package listeners

import (
	"testing"
)

func TestHttpListener(t *testing.T) {

	listener := NewHttpListener(NewHttpListenerRequest{
		Name:            "Test Listener",
		Port:            8080,
		Secure:          false,
		ResponseHeaders: []string{"X-Test-Header: value"},
		Uris:            []string{"/test", "/health"},
	})

	if listener.Name != "Test Listener" {
		t.Errorf("Expected listener name 'Test Listener', got '%s'", listener.Name)
	}

	if listener.Id == "" {
		t.Error("Expected listener ID to be generated, got empty string")
	}
}
