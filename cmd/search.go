package cmd

import (
	"errors"
	"fmt"

	"github.com/airRnot1106/bkm/internal/opener"
	"github.com/airRnot1106/bkm/internal/selector"
	"github.com/airRnot1106/bkm/internal/storage"
	"github.com/airRnot1106/bkm/internal/usecase"
	"github.com/spf13/cobra"
)

// searchCmd represents the search command
var searchCmd = &cobra.Command{
	Use:   "search",
	Short: "Search and open a bookmark",
	Long: `Search for bookmarks and open the selected one in your browser.

You can filter by tags:
  bkm search --tags go,cli

Or run without flags to search all bookmarks:
  bkm search`,
	RunE: runSearch,
}

func init() {
	rootCmd.AddCommand(searchCmd)

	searchCmd.Flags().StringSliceP("tags", "T", []string{}, "Filter by tags (comma-separated)")
}

func runSearch(cmd *cobra.Command, args []string) error {
	tags, err := cmd.Flags().GetStringSlice("tags")
	if err != nil {
		return fmt.Errorf("failed to get tags flag: %w", err)
	}

	input := usecase.SearchBookmarkInput{
		Tags: tags,
	}

	repo, err := storage.NewDefaultJSONStorage()
	if err != nil {
		return fmt.Errorf("failed to initialize storage: %w", err)
	}

	sel := selector.NewFuzzyFinderSelector()

	selectUc := usecase.NewSearchBookmark(repo, sel)

	bookmark, err := selectUc.Execute(input)
	if err != nil {
		if errors.Is(err, selector.ErrCancelled) {
			return nil
		}
		return fmt.Errorf("failed to search bookmark: %w", err)
	}

	op := opener.NewBrowserOpener()

	openUc := usecase.NewOpenBookmark(op)

	openInput := usecase.OpenBookmarkInput{
		Bookmark: bookmark,
	}

	if err := openUc.Execute(openInput); err != nil {
		return fmt.Errorf("failed to open bookmark: %w", err)
	}

	return nil
}
