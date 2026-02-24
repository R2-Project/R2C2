package agents

type SessionsRepository interface {
	SaveSession(agent *Agent) error
	GetSessions() ([]Agent, error)
	GetSession(agentId string) (*Agent, error)
	DeleteSession(agentId string) error
}
