package database

import (
	"database/sql"

	"github.com/mati-olivera/R2C2/internal/core/agents"
)

type SessionsRepository struct {
	db *sql.DB
}

func InitSessionsRepository(db *sql.DB) *SessionsRepository {
	return &SessionsRepository{
		db: db,
	}
}

func (r *SessionsRepository) GetSessions() ([]agents.Agent, error) {
	rows, err := r.db.Query("SELECT id, listener_id, status, arch, format, timestamp, last_ping, computer, user, internal_ip, public_ip FROM sessions")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []agents.Agent
	for rows.Next() {
		var agent agents.Agent
		if err := rows.Scan(&agent.Id, &agent.ListenerId, &agent.Status, &agent.Arch, &agent.Format, &agent.Timestamp, &agent.LastPing, &agent.Computer, &agent.User, &agent.InternalIp, &agent.PublicIp); err != nil {
			return nil, err
		}
		sessions = append(sessions, agent)
	}
	return sessions, nil
}

func (r *SessionsRepository) SaveSession(agent agents.Agent) error {
	_, err := r.db.Exec(`
		INSERT INTO sessions (id, listener_id, status, arch, format, timestamp, last_ping, computer, user, internal_ip, public_ip)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET
			listener_id=excluded.listener_id,
			status=excluded.status,
			arch=excluded.arch,
			format=excluded.format,
			timestamp=excluded.timestamp,
			last_ping=excluded.last_ping,
			computer=excluded.computer,
			user=excluded.user,
			internal_ip=excluded.internal_ip,
			public_ip=excluded.public_ip
	`, agent.Id, agent.ListenerId, agent.Status, agent.Arch, agent.Format, agent.Timestamp, agent.LastPing, agent.Computer, agent.User, agent.InternalIp, agent.PublicIp)
	return err
}
