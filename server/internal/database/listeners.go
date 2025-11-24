package database

import (
	"database/sql"
	"github.com/mati-olivera/R2C2/internal/core/listeners"
)

type ListenersRepository struct {
	db *sql.DB
}

func InitListenersRepository(db *sql.DB) *ListenersRepository {
	return &ListenersRepository{
		db: db,
	}
}

func (lr *ListenersRepository) SaveListener(listener *listeners.Listener) error {
	query := `INSERT INTO listeners (id, name, protocol, config) VALUES (?, ?, ?, ?)`
	_, err := lr.db.Exec(query, listener.Id, listener.Name, listener.Protocol, listener.Config)
	return err
}

func (lr *ListenersRepository) GetListeners() *[]listeners.Listener {
	query := `SELECT id, name, protocol, config FROM listeners`
	rows, err := lr.db.Query(query)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var listenersList []listeners.Listener
	for rows.Next() {
		var listener listeners.Listener
		err := rows.Scan(&listener.Id, &listener.Name, &listener.Protocol, &listener.Config)
		if err != nil {
			continue
		}
		listenersList = append(listenersList, listener)
	}
	return &listenersList
}
