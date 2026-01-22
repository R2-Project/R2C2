package tasks

import "errors"

var ErrNoCommand = errors.New("task command is empty")
var ErrCommandNotFound = errors.New("command not found")
