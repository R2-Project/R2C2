package cli

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

func init() {
	rootCmd.Flags().BoolVar(&start, "start", false, "Start the R2C2 server")
	rootCmd.PersistentFlags().StringP("config", "c", "", "Path to the configuration file")
}

var rootCmd = &cobra.Command{
	Use:     "r2c2",
	Aliases: []string{"r2"},
	Short:   "R2C2 command and control",
	Long:    "R2C2 is a command and control server for red teaming post-explotation operations.\nComplete documentation is available at https://github.com/mati-olivera/r2c2/wiki.",
	RunE: func(cmd *cobra.Command, args []string) error {
		if start {
			configPathFlag, _ := cmd.Flags().GetString("config")
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

			// Start Server
			err = api.StartServer(conf.Api.Port)
			if err != nil {
				return fmt.Errorf("failed to start server: %w", err)
			}
			return nil
		}

		fmt.Println(`
 ____  ____   ___ ____
|  _ \|___ \ / __|___ \
| |_) | __) | |    __) |
|  _ < / __/| |__ / __/
|_| \_\_____|\___|_____|
`)
		return cmd.Help()
	},
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
