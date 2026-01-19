package agents

import (
	"time"

	"github.com/google/uuid"
)

type AgentsService struct {
	SessionsRepository SessionsRepository
}

func NewAgentsService(sessionsRepo SessionsRepository) *AgentsService {
	return &AgentsService{
		SessionsRepository: sessionsRepo,
	}
}

func (as *AgentsService) CreateAgent(data NewAgentRequest) (*Agent, error) {

	shortUUID := uuid.New().String()[:8]
	agent := &Agent{
		Id:        shortUUID,
		Name:      data.Name,
		Listener:  data.Listener, // might populate this data later
		Status:    "inactive",    // TODO:
		Arch:      data.Arch,
		Format:    data.Format,
		Timestamp: time.Now().Unix(),
	}

	err := as.SessionsRepository.SaveSession(agent)
	if err != nil {
		return nil, err
	}

	return agent, nil
}
