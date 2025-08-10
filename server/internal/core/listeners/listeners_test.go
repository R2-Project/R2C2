package listeners

import (
	"sync"
	"testing"
)

func TestListeners(t *testing.T) {
	listeners := &Listeners{
		httpListeners: make(map[string]*HttpListener),
		mutex:         &sync.RWMutex{},
	}

	listener := NewHttpListener(NewHttpListenerRequest{
		Name:            "Test Listener",
		Port:            8080,
		Secure:          false,
		ResponseHeaders: []string{"X-Test-Header: value"},
		Uris:            []string{"/test", "/health"},
	})

	// Add the listener to the manager
	listeners.AddHttpListener(listener)

	// Retrieve the listener by ID
	retrievedListener := listeners.GetHttpListener(listener.Id)
	if retrievedListener == nil || retrievedListener.Id != listener.Id {
		t.Errorf("Expected to retrieve listener with ID %s, got %v", listener.Id, retrievedListener)
	}

	// Remove the listener
	listeners.RemoveHttpListener(listener.Id)
	if listeners.GetHttpListener(listener.Id) != nil {
		t.Error("Expected listener to be removed")
	}
}
