package config

import (
	"log"
	"os"
	"sync"

	"gopkg.in/yaml.v3"
)

var cfg *Config
var once sync.Once

type Config struct {
	Api ApiConfig `yaml:"api"`
	// Operators []Operator `yaml:"profile"`
}

type ApiConfig struct {
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	Protocol string `yaml:"protocol"`
}

func GetConfig(path string) (*Config, error) {
	once.Do(func() {

		data, err := os.ReadFile(path)
		if err != nil {
			log.Fatalf("FATAL: Failed to read configuration file: %v", err)
		}

		var tempCfg Config

		err = yaml.Unmarshal(data, &tempCfg)
		if err != nil {
			log.Fatalf("FATAL: Failed to parse configuration file: %v", err)
		}

		cfg = &tempCfg
	})

	return cfg, nil
}
