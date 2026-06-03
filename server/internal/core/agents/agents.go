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
	OS       string `json:"os"`
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
	OS       string `json:"os"`
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

// resolveTarget maps OS + Arch to a Rust target triple.
func resolveTarget(os, arch string) (string, error) {
	targets := map[string]map[string]string{
		"windows": {
			"x64": "x86_64-pc-windows-gnu",
			"x86": "i686-pc-windows-gnu",
		},
		"macos": {
			"x64":   "x86_64-apple-darwin",
			"arm64": "aarch64-apple-darwin",
		},
		"linux": {
			"x64":   "x86_64-unknown-linux-gnu",
			"arm64": "aarch64-unknown-linux-gnu",
		},
	}

	archMap, ok := targets[os]
	if !ok {
		return "", fmt.Errorf("unsupported OS: %s", os)
	}
	target, ok := archMap[arch]
	if !ok {
		return "", fmt.Errorf("unsupported arch %s for OS %s", arch, os)
	}
	return target, nil
}

// outputBinaryName returns the cargo output filename for a given format.
// "native" means a plain Unix binary with no extension.
func outputBinaryName(format string) string {
	switch format {
	case ".dylib":
		return "libimplant.dylib"
	case ".so":
		return "libimplant.so"
	case "native":
		return "implant"
	default:
		return "implant" + format
	}
}

// destExtension returns the file extension (or empty string) to append to the
// agent name when storing the payload on disk.
func destExtension(format string) string {
	if format == "native" {
		return ""
	}
	return format
}

func (a *Agent) Build() (*string, error) {
	target, err := resolveTarget(a.OS, a.Arch)
	if err != nil {
		return nil, err
	}

	implantDir := os.Getenv("IMPLANT_SOURCE_PATH")
	if implantDir == "" {
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
	switch a.Format {
	case ".dll", ".dylib", ".so":
		features = append(features, "dll")
		args = append(args, "--lib")
	}
	args = append(args, "--features", strings.Join(features, ","))

	cmd := exec.Command("cargo", args...)
	cmd.Env = append(os.Environ(), environ...)
	cmd.Dir = implantDir

	if output, err := cmd.CombinedOutput(); err != nil {
		return nil, fmt.Errorf("compilation failed out: %s - err: %w", string(output), err)
	}

	binaryPath := filepath.Join(implantDir, "target", target, "release", outputBinaryName(a.Format))

	if err := os.MkdirAll("/tmp/payloads", os.ModePerm); err != nil {
		return nil, err
	}

	ext := destExtension(a.Format)
	destPath := "/tmp/payloads/" + a.Name + ext

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

	agent := a.Name + ext
	return &agent, nil
}
