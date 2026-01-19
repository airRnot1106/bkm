package cmd

import (
	"errors"
	"fmt"
	"strings"

	"github.com/airRnot1106/bkm/internal/selector"
	"github.com/airRnot1106/bkm/internal/storage"
	"github.com/airRnot1106/bkm/internal/usecase"
	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"
)

// deleteCmd represents the delete command
var deleteCmd = &cobra.Command{
	Use:   "delete",
	Short: "Delete a bookmark",
	Long: `Delete a bookmark from your collection.

You can filter by tags:
  bkm delete --tags go,cli

Or run without flags to delete from all bookmarks:
  bkm delete

You will be prompted to confirm before deletion.`,
	RunE: runDelete,
}

func init() {
	rootCmd.AddCommand(deleteCmd)

	deleteCmd.Flags().StringSliceP("tags", "T", []string{}, "Filter by tags (comma-separated)")
}

func runDelete(cmd *cobra.Command, args []string) error {
	tags, err := cmd.Flags().GetStringSlice("tags")
	if err != nil {
		return fmt.Errorf("failed to get tags flag: %w", err)
	}

	repo, err := storage.NewDefaultJSONStorage()
	if err != nil {
		return fmt.Errorf("failed to initialize storage: %w", err)
	}

	sel := selector.NewFuzzyFinderSelector()

	// Use SearchBookmark to let user select which bookmark to delete
	searchInput := usecase.SearchBookmarkInput{
		Tags: tags,
	}
	searchUc := usecase.NewSearchBookmark(repo, sel)
	bookmark, err := searchUc.Execute(searchInput)
	if err != nil {
		if errors.Is(err, selector.ErrCancelled) {
			return nil
		}
		return fmt.Errorf("failed to search bookmark: %w", err)
	}

	// Show the bookmark details and ask for confirmation
	fmt.Printf("\nYou are about to delete the following bookmark:\n")
	fmt.Printf("  Title: %s\n", bookmark.Title.Value())
	fmt.Printf("  URL:   %s\n", bookmark.URL.Value())
	if bookmark.Description.Value() != "" {
		fmt.Printf("  Desc:  %s\n", bookmark.Description.Value())
	}
	if len(bookmark.Tags) > 0 {
		tagStrs := make([]string, len(bookmark.Tags))
		for i, tag := range bookmark.Tags {
			tagStrs[i] = tag.Value()
		}
		fmt.Printf("  Tags:  %s\n", strings.Join(tagStrs, ", "))
	}
	fmt.Println()

	prompt := promptui.Prompt{
		Label:     "Are you sure you want to delete this bookmark",
		IsConfirm: true,
	}

	_, err = prompt.Run()
	if err != nil {
		fmt.Println("Deletion cancelled.")
		return nil
	}

	// Perform the deletion
	if err := repo.Delete(bookmark.ID); err != nil {
		return fmt.Errorf("failed to delete bookmark: %w", err)
	}

	fmt.Println("Bookmark deleted successfully.")
	return nil
}
