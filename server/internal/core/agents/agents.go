package agents

type Agent struct {
	Id         string `json:"id"`
	ListenerId string `json:"listener_id"`
	Status     string `json:"status"`
	Arch       string `json:"arch"`
	Format     string `json:"format"`
	// Sleep and jitter?
	Timestamp int64 `json:"timestamp"`
	// WorkingTime string `json:"working_time"`
	// KillDate int64  `json:"kill_date"`
}

// Generates the implant to be deployed on the target system given the agent config
func (a *Agent) Build() error {
	// Placeholder for build logic
	return nil
}
