package tasks

type TaskRepository interface {
	SaveTask(task *Task) error
	GetTasks() *[]Task
	GetTaskById(id string) (*Task, error)
}
