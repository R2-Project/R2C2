package tasks

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/mati-olivera/R2C2/internal/core/broadcaster"
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

func (tm *TaskManager) Queue(agentId string, command string, args []string) (*TaskQueueResult, error) {

	result := &TaskQueueResult{}

	if command == "" {
		logger.Error("error queueing task", ErrNoCommand)
		return nil, ErrNoCommand
	}

	if command == "help" {
		result.Commands = &CommandsRegistry
		return result, nil
	}

	cmdNotFound := true
	for _, cmd := range CommandsRegistry {
		if cmd.Name == command {
			cmdNotFound = false
			break
		}
	}
	if cmdNotFound {
		return nil, ErrCommandNotFound
	}

	task := &Task{
		AgentId:   agentId,
		Command:   command,
		Args:      args,
		Status:    TaskStatusPending,
		Timestamp: time.Now().Format(time.RFC3339),
	}
	task.GenerateId()

	err := tm.TaskRepository.SaveTask(task)
	if err != nil {
		logger.Error("error saving task to repository", err, "task_id", task.GetId())
		return nil, err
	}
	result.Message = fmt.Sprintf("Task %s queued with id %s", task.Command, task.GetId())

	return result, nil
}

func (tm *TaskManager) FetchTasks(agentId string) (*[]Task, error) {
	tasks, err := tm.TaskRepository.GetPendingTasks(agentId)
	if err != nil {
		return nil, err
	}
	return tasks, nil
}

func (tm *TaskManager) SubmitTaskResult(task TaskResult) error {

	fmt.Printf("Received result for task %v\n", task)
	taskData := Task{
		Id:     task.Task.Id,
		Status: TaskStatusCompleted,
	}
	err := tm.TaskRepository.UpdateTask(&taskData)
	if err != nil {
		return err
	}

	taskResult, err := json.Marshal(task)
	if err != nil {
		return err
	}

	broadcaster.BroadcastEvent(broadcaster.TASK_RESULT_EVENT, string(taskResult))

	return nil
}

func (tm *TaskManager) GetQueuedTasks() (*[]Task, error) {
	tasks, err := tm.TaskRepository.GetTasks()
	if err != nil {
		return nil, err
	}
	return tasks, nil
}
