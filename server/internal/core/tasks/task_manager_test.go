package tasks

import "testing"

type InMemoryTaskRepository struct {
	tasks []Task
}

func NewInMemoryTaskRepository() *InMemoryTaskRepository {
	return &InMemoryTaskRepository{
		tasks: make([]Task, 0),
	}
}

func (r *InMemoryTaskRepository) SaveTask(task *Task) error {
	r.tasks = append(r.tasks, *task)
	return nil
}

func (r *InMemoryTaskRepository) GetTasks() *[]Task {
	return &r.tasks
}

func (r *InMemoryTaskRepository) GetTaskById(id string) (*Task, error) {
	for _, task := range r.tasks {
		if task.GetId() == id {
			return &task, nil
		}
	}
	return nil, nil
}

func TestTaskManager(t *testing.T) {

	manager := CreateTaskManager(NewInMemoryTaskRepository())

	err := manager.Queue("agent1", "echo", []string{"Hello, World!"})
	if err != nil {
		t.Error(err)
	}
}
