package tasks

type TaskRepository interface {
	SaveTask(task *Task) error
	GetTasks() (*[]Task, error)
	GetTaskById(id string) (*Task, error)
	GetPendingTasks(agentId string) (*[]Task, error)
}
