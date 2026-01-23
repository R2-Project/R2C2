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
	rows, err := r.db.Query("SELECT id, listener, status, arch, format, timestamp, last_ping, hostname, user, internal_ip, public_ip, pid, process, sleep, jitter FROM sessions")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []agents.Agent
	for rows.Next() {
		var agent agents.Agent
		if err := rows.Scan(&agent.Id, &agent.Listener, &agent.Status, &agent.Arch, &agent.Format, &agent.Timestamp, &agent.LastPing, &agent.Hostname, &agent.User, &agent.InternalIp, &agent.PublicIp, &agent.Pid, &agent.ProcessName, &agent.Sleep, &agent.Jitter); err != nil {
			return nil, err
		}
		sessions = append(sessions, agent)
	}
	return sessions, nil
}

func (r *SessionsRepository) SaveSession(agent *agents.Agent) error {
	_, err := r.db.Exec(`
		INSERT INTO sessions (id, listener, status, arch, format, timestamp, last_ping, hostname, user, internal_ip, public_ip, pid, process, sleep, jitter)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET
			listener=excluded.listener,
			status=excluded.status,
			arch=excluded.arch,
			format=excluded.format,
			timestamp=excluded.timestamp,
			last_ping=excluded.last_ping,
			hostname=excluded.hostname,
			user=excluded.user,
			internal_ip=excluded.internal_ip,
			public_ip=excluded.public_ip,
			pid=excluded.pid,
			process=excluded.process,
			sleep=excluded.sleep,
			jitter=excluded.jitter
	`, agent.Id, agent.Listener, agent.Status, agent.Arch, agent.Format, agent.Timestamp, agent.LastPing, agent.Hostname, agent.User, agent.InternalIp, agent.PublicIp, agent.Pid, agent.ProcessName, agent.Sleep, agent.Jitter)
	return err
}

func (r *SessionsRepository) GetSession(agentId string) (*agents.Agent, error) {
	row := r.db.QueryRow("SELECT id, listener, status, arch, format, timestamp, last_ping, hostname, user, internal_ip, public_ip, pid, process, sleep, jitter FROM sessions WHERE id = ?", agentId)

	var agent agents.Agent
	if err := row.Scan(&agent.Id, &agent.Listener, &agent.Status, &agent.Arch, &agent.Format, &agent.Timestamp, &agent.LastPing, &agent.Hostname, &agent.User, &agent.InternalIp, &agent.PublicIp, &agent.Pid, &agent.ProcessName, &agent.Sleep, &agent.Jitter); err != nil {
		return nil, err
	}
	return &agent, nil
}
