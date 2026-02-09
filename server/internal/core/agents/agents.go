package agents

import (
	"fmt"
	"os"
	"os/exec"
)

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
	// TODO: cycling uris
	// Uris      []string `json:"uris"`
}

func (a *Agent) Build() (*string, error) {

	// TODO: make this dynamic
	target := "x86_64-unknown-linux-gnu"

	cmd := exec.Command("cargo", "build", "--features", "http", "--release", "--target", target)

	cmd.Env = append(os.Environ(),
		"LISTENER_ADDRESS="+a.Listener,
		"SESSION_ID="+a.Id,
	)
	cmd.Dir = "../../../../implant"

	if output, err := cmd.CombinedOutput(); err != nil {
		return nil, fmt.Errorf("compilation failed out: %s - err: %w", string(output), err)
	}

	binaryPath := "./implant/target/" + target + "/release/implant" + a.Format

	err := os.Rename(binaryPath, "./agents/"+a.Name+a.Format)
	if err != nil {
		return nil, err
	}

	agentPath := "./agents/" + a.Name + a.Format

	return &agentPath, nil
}
