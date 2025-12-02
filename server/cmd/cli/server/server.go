package server

import (
	"fmt"
	"os"

	"github.com/mati-olivera/R2C2/internal/api"
	"github.com/mati-olivera/R2C2/internal/config"
	"github.com/mati-olivera/R2C2/internal/core/auth"
	"github.com/mati-olivera/R2C2/internal/database"
	"github.com/spf13/cobra"
)

var start bool
var stop bool

func init() {
	ServerCmd.Flags().BoolVar(&start, "start", true, "--start")
}

var ServerCmd = &cobra.Command{
	Use:   "server",
	Short: "R2C2 Server",
	Long:  "R2C2 Server will start a server for listening clients and beacons.",
	RunE: func(cmd *cobra.Command, args []string) error {
		if start {
			configPathFlag := cmd.Flag("config").Value.String()
			if configPathFlag == "" {
				return fmt.Errorf("the --config flag with the configuration file path is required")
			}
			conf, err := config.LoadConfig(configPathFlag)
			if err != nil {
				return fmt.Errorf("failed to get configuration: %w", err)
			}
			db, err := config.InitDatabase(conf.DatabasePath)
			if err != nil {
				return fmt.Errorf("failed to initialize database: %w", err)
			}

			authRepo := database.InitOperatorsRepository(db.GetInstance())
			authService := auth.NewAuthService(authRepo)
			_, err = authService.LoadOperator(conf)
			if err != nil {
				return fmt.Errorf("failed to load default operator: %w", err)
			}

			err = api.StartServer(conf.Api.Port)
			if err != nil {
				return fmt.Errorf("failed to start server: %w", err)
			}
		}

		cmd.Help()
		return nil
	},
}

func Execute() {
	if err := ServerCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
