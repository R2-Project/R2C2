package cli

import (
	"fmt"
	"os"

	"github.com/mati-olivera/R2C2/cmd/cli/server"
	"github.com/spf13/cobra"
)

func init() {
	rootCmd.AddCommand(server.ServerCmd)
	rootCmd.PersistentFlags().StringP("config", "c", "", "Path to the configuration file")
}

var rootCmd = &cobra.Command{
	Use:     "r2c2",
	Aliases: []string{"r2"},
	Short:   "R2C2 command and control",
	Long:    "R2C2 is a command and control server for red teaming post-explotation operations.\nComplete documentation is available at https://github.com/mati-olivera/r2c2/wiki.",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("IMPRIMI UN LOGO EN ASCII RE CHETO ACA")
	},
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
