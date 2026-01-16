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

	agent := &Agent{
		Id:         uuid.New().String(),
		Name:       data.Name,
		ListenerId: data.ListenerId,
		Status:     "inactive", // TODO:
		Arch:       data.Arch,
		Format:     data.Format,
		Timestamp:  time.Now().Unix(),
	}

	err := as.SessionsRepository.SaveSession(agent)
	if err != nil {
		return nil, err
	}

	return agent, nil
}
