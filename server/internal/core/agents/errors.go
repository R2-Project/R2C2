package agents

import "errors"

var (
	ErrInvalidAgentName   = errors.New("agent name contains invalid characters")
	ErrInvalidAgentFormat = errors.New("agent format is not supported")
)
