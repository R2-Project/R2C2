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
		Description: "Executes cmd.exe command",
		Usage:       "shell <command>",
		Args: []CommandArg{
			{
				Name:     "command",
				Required: true,
				Desc:     "The command to execute",
			},
		},
		Platforms: nil,
	},
	{
		Name:        "ls",
		Description: "List files in the current directory",
		Usage:       "ls [path]",
		Args: []CommandArg{
			{
				Name:     "path",
				Required: false,
			},
		},
	},
	{
		Name:        "pwd",
		Description: "Print the current working directory",
		Usage:       "pwd",
	},
	{
		Name:        "cd",
		Description: "Change the current working directory",
		Usage:       "cd <path>",
		Args: []CommandArg{
			{
				Name:     "path",
				Required: true,
				Desc:     "Path to change directory to",
			},
		},
	},
	{
		Name:        "whoami",
		Description: "Display the current user",
		Usage:       "whoami",
	},
	{
		Name:        "sleep",
		Description: "Sets the sleep and jitter time in seconds time",
		Usage:       "sleep <seconds> <jitter>",
	},
	{
		Name:        "ps",
		Description: "List running processes",
		Usage:       "ps",
	},
}
