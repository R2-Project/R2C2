package config

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

type Database struct {
	running bool
	db      *sql.DB
	path    string
}

func (d *Database) Init(path string) error {
	if d.running {
		return nil
	}

	d.path = path

	db, err := sql.Open("sqlite3", path)
	if err != nil {
		log.Fatal(err)
	}
	d.db = db
	defer db.Close()

	err = d.createListenersTable()
	if err != nil {
		log.Fatal("Failed to create listeners table:", err)
	}

	err = d.createOperatorsTable()
	if err != nil {
		log.Fatal("Failed to create operators table:", err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal("Database connection failed:", err)
	}
	log.Printf("Successfully connected to the database.")

	return nil
}

func (d *Database) Path() string {
	return d.path
}

func (d *Database) createListenersTable() error {
	createTableSQL := `CREATE TABLE IF NOT EXISTS listeners (
		"id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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

	log.Println("Listeners table created.")
	return nil
}

func (d *Database) createOperatorsTable() error {
	createTableSQL := `CREATE TABLE IF NOT EXISTS operators (
		"id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		"username" TEXT,
		"password_hash" TEXT,
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

	log.Println("Operators table created.")
	return nil
}
