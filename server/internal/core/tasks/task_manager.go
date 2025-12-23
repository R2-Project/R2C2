package tasks

import (
	"time"

	"github.com/mati-olivera/R2C2/internal/core/logger"
)

type TaskManager struct {
	TaskRepository TaskRepository
}

func CreateTaskManager(taskRepository TaskRepository) *TaskManager {
	return &TaskManager{
		TaskRepository: taskRepository,
	}
}

func (tm *TaskManager) Queue(agentId string, command string, args []string) error {

	task := &Task{
		AgentId:   agentId,
		Command:   command,
		Args:      args,
		Status:    TaskStatusPending,
		Timestamp: time.Now().Format(time.RFC3339),
	}
	task.GenerateId()

	if task.Command == "" {
		logger.Error("error queueing task", ErrNoCommand, "task_id", task.GetId())
		return ErrNoCommand
	}

	logger.Info("task queued", "task_id", task.GetId())

	err := tm.TaskRepository.SaveTask(task)
	if err != nil {
		logger.Error("error saving task to repository", err, "task_id", task.GetId())
		return err
	}
	return nil
}

func (tm *TaskManager) FetchTasks(agentId string) (*[]Task, error) {
	tasks, err := tm.TaskRepository.GetPendingTasks(agentId)
	if err != nil {
		return nil, err
	}
	return tasks, nil
}
