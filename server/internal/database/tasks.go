package database

import (
	"database/sql"
	"encoding/json"

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
	args, err := json.Marshal(task.Args)
	if err != nil {
		return err
	}

	query := `INSERT INTO tasks (id, agent_id, command, args, status, timestamp) VALUES (?, ?, ?, ?, ?, ?)`
	_, err = r.db.Exec(query, task.Id, task.AgentId, task.Command, args, task.Status, task.Timestamp)
	return err
}

func (r *TasksRepository) GetTasks() (*[]tasks.Task, error) {
	query := `SELECT id, agent_id, command, args, status, timestamp FROM tasks`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []tasks.Task
	for rows.Next() {
		var task tasks.Task
		if err := rows.Scan(&task.Id, &task.AgentId, &task.Command, &task.Args, &task.Status, &task.Timestamp); err != nil {
			return nil, err
		}
		result = append(result, task)
	}
	return &result, nil
}

func (r *TasksRepository) GetTaskById(id string) (*tasks.Task, error) {
	query := `SELECT id, agent_id, command, args, status, timestamp FROM tasks WHERE id = ?`
	row := r.db.QueryRow(query, id)
	var task tasks.Task
	if err := row.Scan(&task.Id, &task.AgentId, &task.Command, &task.Args, &task.Status, &task.Timestamp); err != nil {
		return nil, err
	}
	return &task, nil
}

func (r *TasksRepository) GetPendingTasks(agentId string) (*[]tasks.Task, error) {
	query := `SELECT id, agent_id, command, args, status, timestamp FROM tasks WHERE agent_id = ? AND status = 'pending'`
	rows, err := r.db.Query(query, agentId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []tasks.Task
	for rows.Next() {
		var task tasks.Task
		var argsJson []byte
		if err := rows.Scan(&task.Id, &task.AgentId, &task.Command, &argsJson, &task.Status, &task.Timestamp); err != nil {
			return nil, err
		}
		if len(argsJson) > 0 {
			if err := json.Unmarshal(argsJson, &task.Args); err != nil {
				return nil, err
			}
		}
		result = append(result, task)
	}
	return &result, nil
}

func (r *TasksRepository) UpdateTask(task *tasks.Task) error {
	query := `UPDATE tasks SET status = ? WHERE id = ?`
	_, err := r.db.Exec(query, task.Status, task.Id)
	return err
}
