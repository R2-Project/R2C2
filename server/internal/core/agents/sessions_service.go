package agents

import "time"

type SessionsService struct {
	repo SessionsRepository
}

func NewSessionsService(repo SessionsRepository) *SessionsService {
	return &SessionsService{
		repo: repo,
	}
}

func (s *SessionsService) GetSessions() ([]Agent, error) {
	return s.repo.GetSessions()
}

func (s *SessionsService) SaveSession(agent Agent) error {
	return s.repo.SaveSession(&agent)
}

func (s *SessionsService) UpdateLastPing(agentId string, timestamp time.Time) error {
	agents, err := s.repo.GetSessions()
	if err != nil {
		return err
	}

	for _, agent := range agents {
		if agent.Id == agentId {
			agent.LastPing = timestamp.Format(time.RFC3339)
			return s.repo.SaveSession(&agent)
		}
	}

	return nil
}
