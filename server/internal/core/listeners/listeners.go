package listeners

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/mati-olivera/R2C2/internal/core/logger"
)

type Listener struct {
	Id       string `json:"id"`
	Name     string `json:"name"`
	Config   string `json:"config"`
	Protocol string `json:"protocol"`
}

type ListenersRepository interface {
	GetListeners() *[]Listener
	SaveListener(listener *Listener) error
}

func NewListenersService(listenersRepository ListenersRepository) *ListenersService {
	return &ListenersService{
		listenerRepository: listenersRepository,
	}
}

type ListenersService struct {
	listenerRepository ListenersRepository
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

	logger.Info(fmt.Sprintf("HTTP Listener '%s' created", httpListener.Name), httpListener.Host, httpListener.Port)

	// TODO: go httpListener.Start()

	return httpListener, nil
}

func (l *ListenersService) GetListeners() *[]Listener {
	return l.listenerRepository.GetListeners()
}
