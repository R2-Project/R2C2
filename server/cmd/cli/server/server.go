package server

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var start bool
var host string
var port int
var protocol string

func init() {
	ServerCmd.Flags().BoolVar(&start, "start", true, "--start")
	ServerCmd.Flags().StringVarP(&host, "host", "H", "127.0.0.0", "")
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
		fmt.Println("SERVERRRRRRR")
		return nil
	},
}

func Execute() {
	if err := ServerCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
