package agents

import (
	"encoding/json"
	"time"

	"github.com/mati-olivera/R2C2/internal/core/broadcaster"
)

type SessionsService struct {
	repo SessionsRepository
}

func NewSessionsService(repo SessionsRepository) *SessionsService {
	return &SessionsService{
		repo: repo,
	}
}

func (s *SessionsService) GetSession(agentId string) (*Agent, error) {
	return s.repo.GetSession(agentId)
}

func (s *SessionsService) GetSessions() ([]Agent, error) {
	return s.repo.GetSessions()
}

func (s *SessionsService) SaveSession(agent Agent) error {
	return s.repo.SaveSession(&agent)
}

func (s *SessionsService) UpdateLastPing(agentId string, timestamp time.Time) error {
	agent, err := s.repo.GetSession(agentId)
	if err != nil {
		return err
	}
	agent.LastPing = timestamp.Format(time.RFC3339)

	agentData, err := json.Marshal(agent)
	if err != nil {
		return err
	}

	broadcaster.BroadcastEvent(broadcaster.BEACON_UPDATED_EVENT, string(agentData))

	return s.repo.SaveSession(agent)
}

func (s *SessionsService) UpdateSleep(agentId string, sleep int, jitter int) error {
	agent, err := s.repo.GetSession(agentId)
	if err != nil {
		return err
	}
	agent.Sleep = sleep
	agent.Jitter = jitter

	return s.repo.SaveSession(agent)
}
