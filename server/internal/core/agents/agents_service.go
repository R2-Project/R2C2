package agents

import (
	"regexp"
	"time"

	"github.com/google/uuid"
	"github.com/mati-olivera/R2C2/internal/core/logger"
)

type AgentsService struct {
	SessionsRepository SessionsRepository
}

func NewAgentsService(sessionsRepo SessionsRepository) *AgentsService {
	return &AgentsService{
		SessionsRepository: sessionsRepo,
	}
}

func (as *AgentsService) CreateAgent(data NewAgentRequest) (*string, error) {

	re := regexp.MustCompile(`[^a-zA-Z0-9\s]`)
	if re.MatchString(data.Name) {
		return nil, ErrInvalidAgentName
	}

	if data.Format != ".exe" && data.Format != ".dll" {
		return nil, ErrInvalidAgentFormat
	}

	shortUUID := uuid.New().String()[:8]
	agent := &Agent{
		Id:        shortUUID,
		Name:      data.Name,
		Listener:  data.Listener, // might populate this data later
		Status:    "inactive",
		Arch:      data.Arch,
		Format:    data.Format,
		Timestamp: time.Now().Unix(),
	}

	binaryPath, err := agent.Build()
	if err != nil {
		logger.Error("Failed to build agent binary", err)
		return nil, err
	}

	err = as.SessionsRepository.SaveSession(agent)
	if err != nil {
		return nil, err
	}

	return binaryPath, nil
}
