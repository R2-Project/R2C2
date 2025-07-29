package server

import (
	"fmt"
	"os"

	"github.com/mati-olivera/R2C2/internal/api"
	"github.com/spf13/cobra"
)

var start bool
var host string
var port int
var protocol string

func init() {
	ServerCmd.Flags().BoolVar(&start, "start", true, "--start")
	ServerCmd.Flags().StringVarP(&host, "host", "H", "0.0.0.0", "")
	ServerCmd.Flags().IntVarP(&port, "port", "P", 8080, "")
	ServerCmd.Flags().StringVarP(&protocol, "protocol", "", "http", "http,https")
}

var ServerCmd = &cobra.Command{
	Use:   "server",
	Short: "R2C2 Server",
	Long:  "R2C2 Server will start a server for listening clients and beacons.",
	RunE: func(cmd *cobra.Command, args []string) error {
		if protocol != "http" && protocol != "https" {
			return fmt.Errorf("invalid value for --protocol: %s (allowed: http, https)", protocol)
		}

		if start {
			err := api.StartServer(host, port, protocol)
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
