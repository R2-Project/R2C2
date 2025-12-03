package config

import (
	"log"
	"os"
	"sync"

	"github.com/mati-olivera/R2C2/internal/core/cripto"
	"github.com/mati-olivera/R2C2/internal/core/operators"
	"gopkg.in/yaml.v3"
)

var cfg *Config
var once sync.Once

type Config struct {
	Api          ApiConfig                `yaml:"api"`
	Operators    []operators.OperatorLoad `yaml:"operators"`
	DatabasePath string                   `yaml:"database_path"`
	JWTSecret    string                   `yaml:"jwt_secret"`
}

func LoadConfig(path string) (*Config, error) {
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

		if cfg.JWTSecret == "" {
			secret, err := cripto.GenerateRandomHexString(38)
			if err != nil {
				log.Fatalf("error generating jwt secret: %v", err)
			}

			cfg.JWTSecret = secret
			data, err := yaml.Marshal(cfg)
			if err != nil {
				log.Fatalf("FATAL: Failed to marshal configuration file: %v", err)
			}

			err = os.WriteFile(path, data, 0644)
			if err != nil {
				log.Fatalf("Error writing file: %v", err)
			}
		}
	})

	return cfg, nil
}

func GetConfig() *Config {
	if cfg == nil {
		log.Fatalf("FATAL: Configuration not loaded. Call LoadConfig first.")
	}
	return cfg
}
