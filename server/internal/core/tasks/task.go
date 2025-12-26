package tasks

import "github.com/google/uuid"

type Task struct {
	Id        string   `json:"id"`
	AgentId   string   `json:"agent_id"`
	Command   string   `json:"command"`
	Args      []string `json:"args"`
	Status    string   `json:"status"`
	Timestamp string   `json:"timestamp"`
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
	TaskId  string `json:"task_id"`
	AgentId string `json:"agent_id"`
	Command string `json:"command"`
	Output  string `json:"output"`
}
