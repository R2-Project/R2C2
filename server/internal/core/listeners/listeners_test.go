package listeners

import (
	"testing"
)

type InMemoryListenersRepository struct {
	listeners []Listener
}

func NewInMemoryListenersRepository() *InMemoryListenersRepository {
	return &InMemoryListenersRepository{
		listeners: make([]Listener, 0),
	}
}

func (l *InMemoryListenersRepository) GetListeners() *[]Listener {
	return &l.listeners
}

func (l *InMemoryListenersRepository) SaveListener(listener *Listener) error {
	l.listeners = append(l.listeners, *listener)
	return nil
}

func TestListeners(t *testing.T) {

	listenersService := NewListenersService(NewInMemoryListenersRepository())
	httpListenerRequest := NewHttpListenerRequest{
		Name:            "Test HTTP Listener",
		Host:            "0.0.0.0",
		Port:            8080,
		Secure:          false,
		Uris:            []string{"/test1", "/test2"},
		ResponseHeaders: []string{"X-Test-Header: TestValue"},
	}

	httpListener, err := listenersService.CreateHttpListener(httpListenerRequest)
	if err != nil {
		t.Error(err)
	}

	all := listenersService.GetListeners()
	if len(*all) != 1 {
		t.Errorf("Expected 1 listener, got %d", len(*all))
	}

	if (*all)[0].Id != httpListener.Id {
		t.Errorf("Expected listener ID %s, got %s", httpListener.Id, (*all)[0].Id)
	}
}
