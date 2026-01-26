package agents

type NewAgentRequest struct {
	Name     string `json:"name"`
	Listener string `json:"listener"`
	Arch     string `json:"arch"`
	Format   string `json:"format"`
}

type AgentRegisterData struct {
	Arch        string `json:"arch"`
	Platform    string `json:"platform"`
	Hostname    string `json:"hostname"`
	User        string `json:"username"`
	InternalIp  string `json:"ip"`
	Pid         int64  `json:"pid"`
	ProcessName string `json:"process_name"`
	Sleep       int    `json:"sleep"`
	Jitter      int    `json:"jitter"`
}

type Agent struct {
	Id       string `json:"id"`
	Name     string `json:"name"`
	Listener string `json:"listener"`
	Status   string `json:"status"`
	Arch     string `json:"arch"`
	Format   string `json:"format"`
	// Sleep and jitter?
	Timestamp int64  `json:"timestamp"`
	LastPing  string `json:"last_ping"`
	// WorkingTime string `json:"working_time"`
	// KillDate int64  `json:"kill_date"`
	Platform    string `json:"platform"`
	Hostname    string `json:"hostname"`
	User        string `json:"user"`
	InternalIp  string `json:"internal_ip"`
	PublicIp    string `json:"public_ip"`
	Pid         int64  `json:"pid,omitempty"`
	ProcessName string `json:"process"`
	Sleep       int    `json:"sleep"`
	Jitter      int    `json:"jitter"`
}

// Generates the implant to be deployed on the target system given the agent config
func (a *Agent) Build() error {
	// Placeholder for build logic
	return nil
}
