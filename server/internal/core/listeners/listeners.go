package listeners

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/mati-olivera/R2C2/internal/core/agents"
	"github.com/mati-olivera/R2C2/internal/core/tasks"
)

type Listener struct {
	Id       string `json:"id"`
	Name     string `json:"name"`
	Config   string `json:"config"`
	Protocol string `json:"protocol"`
}

func (l *Listener) GetAddress() (string, error) {
	if l.Protocol == "http" {
		var config struct {
			Host string `json:"host"`
			Port int    `json:"port"`
		}
		err := json.Unmarshal([]byte(l.Config), &config)
		if err != nil {
			return "", fmt.Errorf("Failed to unmarshal listener config: %w", err)
		}
		return fmt.Sprintf("http://%s:%d", config.Host, config.Port), nil
	}
	// TODO: add support for other protocols
	return "", fmt.Errorf("Unsupported protocol: %s", l.Protocol)
}

type ListenersRepository interface {
	GetListeners() *[]Listener
	SaveListener(listener *Listener) error
	DeleteListener(id string) error
}

func NewListenersService(listenersRepository ListenersRepository, taskManager *tasks.TaskManager, sessions *agents.SessionsService) *ListenersService {
	return &ListenersService{
		listenerRepository: listenersRepository,
		taskManager:        taskManager,
		sessionsService:    sessions,
	}
}

type ListenersService struct {
	listenerRepository ListenersRepository
	taskManager        *tasks.TaskManager
	sessionsService    *agents.SessionsService
	listeners          map[string]*HttpListener
}

func (l *ListenersService) CreateHttpListener(request NewHttpListenerRequest) (*HttpListener, error) {

	if request.Secure && request.Cert == nil {
		return nil, fmt.Errorf("Secure HTTP listener requires a certificate")
	}

	httpListener := &HttpListener{
		Id:              uuid.New().String(),
		Name:            request.Name,
		Host:            request.Host,
		Port:            request.Port,
		Secure:          request.Secure,
		Clients:         nil,
		LiveSince:       time.Now().Format(time.RFC3339),
		Status:          "running",
		Cert:            request.Cert,
		ResponseHeaders: request.ResponseHeaders,
		Uris:            request.Uris,
		TaskManager:     l.taskManager,
		Sessions:        l.sessionsService,
	}

	listenerConfig, err := json.Marshal(httpListener)
	if err != nil {
		return nil, fmt.Errorf("Failed to marshal listener config: %w", err)
	}

	listener := &Listener{
		Id:       httpListener.Id,
		Name:     httpListener.Name,
		Protocol: "http",
		Config:   string(listenerConfig),
	}

	err = l.listenerRepository.SaveListener(listener)
	if err != nil {
		return nil, fmt.Errorf("Failed to save listener: %w", err)
	}

	l.listeners[listener.Id] = httpListener

	err = httpListener.Start()
	if err != nil {
		return nil, fmt.Errorf("Failed to start HTTP listener: %w", err)
	}

	return httpListener, nil
}

func (l *ListenersService) GetListeners() *[]Listener {
	return l.listenerRepository.GetListeners()
}

func (l *ListenersService) GetListenerById(id string) (*Listener, error) {
	listeners := l.listenerRepository.GetListeners()
	for _, listener := range *listeners {
		if listener.Id == id {
			return &listener, nil
		}
	}
	return nil, fmt.Errorf("Listener with ID %s not found", id)
}

func (l *ListenersService) DeleteListener(id string) error {

	listener, err := l.GetListenerById(id)
	if err != nil {
		return fmt.Errorf("Failed to get listener: %w", err)
	}
	l.listeners[listener.Id].Stop()

	err = l.listenerRepository.DeleteListener(id)
	if err != nil {
		return fmt.Errorf("Failed to delete listener: %w", err)
	}

	return nil
}
