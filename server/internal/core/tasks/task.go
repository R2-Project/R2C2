package tasks

import "github.com/google/uuid"

type Task struct {
	Id         string   `json:"id"`
	AgentId    string   `json:"agent_id"`
	Command    string   `json:"command"`
	Args       []string `json:"args"`
	Status     string   `json:"status"`
	Timestamp  string   `json:"timestamp"`
	SubmitedAt string   `json:"submited_at,omitempty"`
}

func (t *Task) GetId() string {
	if t.Id == "" {
		t.GenerateId()
	}
	return t.Id
}

func (t *Task) GenerateId() {
	id := uuid.New().String()
	t.Id = id[:8]
}

type QueueTaskRequest struct {
	AgentId string   `json:"agent_id"`
	Command string   `json:"command"`
	Args    []string `json:"args"`
}

type TaskResult struct {
	Task   Task   `json:"task"`
	Output string `json:"output"`
}

type TaskQueueResult struct {
	Message  string               `json:"message"`
	Commands *[]CommandDefinition `json:"commands,omitempty"`
}
