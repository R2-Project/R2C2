package config

import (
	"database/sql"
	"os"
	"path/filepath"

	"github.com/mati-olivera/R2C2/internal/core/logger"
	_ "github.com/mattn/go-sqlite3"
)

var DB *Database

func InitDatabase(path string) (*Database, error) {
	db := &Database{}
	err := db.Init(path)
	if err != nil {
		return nil, err
	}
	DB = db
	return db, nil
}

type Database struct {
	running bool
	db      *sql.DB
	path    string
}

func (d *Database) GetInstance() *sql.DB {
	return d.db
}

func (d *Database) CloseDB() error {
	if d.db != nil {
		return d.db.Close()
	}
	return nil
}

func (d *Database) Init(path string) error {
	if d.running {
		return nil
	}

	d.path = path

	dir := filepath.Dir(path)
	err := os.MkdirAll(dir, 0755)
	if err != nil {
		logger.Fatal("Failed to create database directory:", err)
	}

	_, err = os.Create(path)
	if err != nil {
		logger.Fatal("Failed to create database file:", err)
	}

	db, err := sql.Open("sqlite3", path)
	if err != nil {
		logger.Fatal("error opening database path:", err)
	}
	d.db = db

	err = d.createListenersTable()
	if err != nil {
		logger.Fatal("Failed to create listeners table:", err)
	}

	err = d.createOperatorsTable()
	if err != nil {
		logger.Fatal("Failed to create operators table:", err)
	}

	err = d.createTasksTable()
	if err != nil {
		logger.Fatal("Failed to create tasks table:", err)
	}

	err = d.createSessionsTable()
	if err != nil {
		logger.Fatal("Failed to create sessions table:", err)
	}

	err = db.Ping()
	if err != nil {
		logger.Fatal("Database connection failed:", err)
	}
	logger.Info("Successfully connected to the database.")

	return nil
}

func (d *Database) Path() string {
	return d.path
}

func (d *Database) createListenersTable() error {
	createTableSQL := `CREATE TABLE IF NOT EXISTS listeners (
		"id" TEXT NOT NULL PRIMARY KEY,
		"name" TEXT,
		"protocol" TEXT,
		"config" JSON,
		"timestamp" DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	statement, err := d.db.Prepare(createTableSQL)
	if err != nil {
		return err
	}
	defer statement.Close()

	_, err = statement.Exec()
	if err != nil {
		return err
	}

	logger.Info("Listeners table created")
	return nil
}

func (d *Database) createOperatorsTable() error {
	createTableSQL := `CREATE TABLE IF NOT EXISTS operators (
		"id" TEXT NOT NULL PRIMARY KEY,
		"username" TEXT,
		"password_hash" TEXT,
		"last_login" DATETIME,
		"created_at" DATETIME
	);`

	statement, err := d.db.Prepare(createTableSQL)
	if err != nil {
		return err
	}
	defer statement.Close()

	_, err = statement.Exec()
	if err != nil {
		return err
	}

	logger.Info("Operators table created")
	return nil
}

func (d *Database) createTasksTable() error {
	createTableSQL := `CREATE TABLE IF NOT EXISTS tasks (
		"id" TEXT NOT NULL PRIMARY KEY,
		"agent_id" TEXT,
		"command" TEXT,
		"args" JSON,
		"status" TEXT,
		"timestamp" DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	statement, err := d.db.Prepare(createTableSQL)
	if err != nil {
		return err
	}
	defer statement.Close()

	_, err = statement.Exec()
	if err != nil {
		return err
	}

	logger.Info("Tasks table created")
	return nil
}

func (d *Database) createSessionsTable() error {
	createTableSQL := `CREATE TABLE IF NOT EXISTS sessions (
		"id" TEXT NOT NULL PRIMARY KEY,
		"listener" TEXT,
		"status" TEXT,
		"arch" TEXT,
		"format" TEXT,
		"computer" TEXT,
		"user" TEXT,
		"internal_ip" TEXT,
		"public_ip" TEXT,
		"timestamp" INT,
		"last_ping" DATETIME NULL,
		"pid" INT NULL
	);`

	statement, err := d.db.Prepare(createTableSQL)
	if err != nil {
		return err
	}
	defer statement.Close()

	_, err = statement.Exec()
	if err != nil {
		return err
	}

	logger.Info("Sessions table created")
	return nil
}
