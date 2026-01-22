package tasks

type CommandArg struct {
	Name     string `json:"name"`
	Required bool   `json:"required"`
	Desc     string `json:"desc"`
}

type CommandDefinition struct {
	Name        string       `json:"name"`
	Description string       `json:"description"`
	Usage       string       `json:"usage"`
	Args        []CommandArg `json:"args"`
	Platforms   []string     `json:"platforms,omitempty"`
}

var CommandsRegistry = []CommandDefinition{
	{
		Name:        "shell",
		Description: "Opens an interactive shell session",
		Usage:       "shell",
		Platforms:   nil,
	},
	{
		Name:        "ls",
		Description: "List files in the current directory",
		Usage:       "ls [path]",
		Args: []CommandArg{
			{
				Name:     "path",
				Required: false,
				Desc:     "Path to list files from",
			},
		},
		Platforms: nil,
	},
	{
		Name:        "exit",
		Description: "Kill the agent process",
		Usage:       "exit",
	},
}
