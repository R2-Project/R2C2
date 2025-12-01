package database

import (
	"database/sql"
	"github.com/mati-olivera/R2C2/internal/core/tasks"
)

type TasksRepository struct {
	db *sql.DB
}

func InitTasksRepository(db *sql.DB) *TasksRepository {
	return &TasksRepository{
		db: db,
	}
}

func (r *TasksRepository) SaveTask(task *tasks.Task) error {
	query := `INSERT INTO tasks (id, agent_id, command, args, status, timestamp) VALUES (?, ?, ?, ?, ?, ?)`
	_, err := r.db.Exec(query, task.Id, task.AgentId, task.Command, task.Args, task.Status, task.Timestamp)
	return err
}

func (r *TasksRepository) GetTasks() (*[]tasks.Task, error) {
	return nil, nil
}
