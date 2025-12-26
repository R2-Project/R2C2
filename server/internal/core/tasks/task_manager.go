package tasks

import (
	"encoding/json"
	"time"

	"github.com/mati-olivera/R2C2/internal/core/logger"
)

type EventHub interface {
	Run()
	BroadcastMessage(message []byte)
}

type TaskManager struct {
	TaskRepository TaskRepository
	eventHub       EventHub
}

func CreateTaskManager(taskRepository TaskRepository, eventHub EventHub) *TaskManager {
	return &TaskManager{
		TaskRepository: taskRepository,
		eventHub:       eventHub,
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

func (tm *TaskManager) SubmitTaskResult(task TaskResult) error {

	taskData := Task{
		Id:     task.TaskId,
		Status: TaskStatusCompleted,
	}
	err := tm.TaskRepository.UpdateTask(&taskData)
	if err != nil {
		return err
	}

	// TODO: broadcast task result
	// add operator issuer?

	taskResult, err := json.Marshal(task)
	if err != nil {
		return err
	}

	// send task result
	tm.eventHub.BroadcastMessage([]byte(taskResult))

	return nil
}
