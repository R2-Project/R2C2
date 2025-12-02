package database

import (
	"database/sql"

	"github.com/mati-olivera/R2C2/internal/core/operators"
)

type OperatorsRepository struct {
	db *sql.DB
}

func InitOperatorsRepository(db *sql.DB) *OperatorsRepository {
	return &OperatorsRepository{
		db: db,
	}
}

func (r *OperatorsRepository) GetOperatorByUsername(username string) (*operators.Operator, error) {
	query := `SELECT id, username, password_hash, created_at, last_login FROM operators WHERE username = ?`
	row := r.db.QueryRow(query, username)

	var operator operators.Operator
	err := row.Scan(&operator.ID, &operator.Username, &operator.PasswordHash, &operator.CreatedAt, &operator.LastLogin)
	if err != nil {
		return nil, err
	}
	return &operator, nil
}

func (r *OperatorsRepository) CreateOperatorIfNotExists(operatorData operators.Operator) error {
	query := `INSERT INTO operators (id, username, password_hash, created_at, last_login) 
			  SELECT ?, ?, ?, ?, ? 
			  WHERE NOT EXISTS (SELECT 1 FROM operators WHERE username = ?)`
	_, err := r.db.Exec(query, operatorData.ID, operatorData.Username, operatorData.PasswordHash, operatorData.CreatedAt, operatorData.LastLogin, operatorData.Username)
	return err
}
