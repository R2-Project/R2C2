package agents

type SessionsRepository interface {
	SaveSession(agent Agent) error
	GetSessions() ([]Agent, error)
}
