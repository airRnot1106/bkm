package cmd

import (
	"os"

	"github.com/spf13/cobra"
)

// version is set by ldflags during build
var version = "dev"

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:     "bkm",
	Short:   "A CLI tool for managing bookmarks",
	Version: version,
	Long: `bkm is a command-line bookmark manager that allows you to:
  - Add bookmarks with URLs, titles, descriptions, and tags
  - Search bookmarks with fuzzy finder
  - Open bookmarks in your default browser`,
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {
	// Add subcommands here
}
