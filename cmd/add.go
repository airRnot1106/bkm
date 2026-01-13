package cmd

import (
	"fmt"
	"strings"

	"github.com/airRnot1106/bkm/internal/bookmark"
	"github.com/airRnot1106/bkm/internal/storage"
	"github.com/airRnot1106/bkm/internal/usecase"
	"github.com/manifoldco/promptui"
	"github.com/spf13/cobra"
)

var (
	url         string
	title       string
	description string
	tags        []string
)

// addCmd represents the add command
var addCmd = &cobra.Command{
	Use:   "add",
	Short: "Add a new bookmark",
	Long: `Add a new bookmark to your collection.

You can use flags to specify bookmark details:
  bkm add --url https://example.com --title "Example" --description "An example site" --tags go,cli

Or run without flags for interactive mode:
  bkm add`,
	RunE: runAdd,
}

func init() {
	rootCmd.AddCommand(addCmd)

	addCmd.Flags().StringVarP(&url, "url", "u", "", "URL of the bookmark")
	addCmd.Flags().StringVarP(&title, "title", "t", "", "Title of the bookmark")
	addCmd.Flags().StringVarP(&description, "description", "d", "", "Description of the bookmark")
	addCmd.Flags().StringSliceVarP(&tags, "tags", "T", []string{}, "Tags (comma-separated)")
}

func runAdd(cmd *cobra.Command, args []string) error {
	flagsProvided := cmd.Flags().Changed("url") ||
		cmd.Flags().Changed("title") ||
		cmd.Flags().Changed("description") ||
		cmd.Flags().Changed("tags")

	var input usecase.AddBookmarkInput

	if flagsProvided {
		input = usecase.AddBookmarkInput{
			URL:         url,
			Title:       title,
			Description: description,
			Tags:        tags,
		}
	} else {
		var err error
		input, err = promptForBookmark()
		if err != nil {
			return fmt.Errorf("failed to get bookmark details: %w", err)
		}
	}

	repo, err := storage.NewJSONStorage("")
	if err != nil {
		return fmt.Errorf("failed to initialize storage: %w", err)
	}

	uc := usecase.NewAddBookmark(repo)
	if err := uc.Execute(input); err != nil {
		return fmt.Errorf("failed to add bookmark: %w", err)
	}

	fmt.Println("Bookmark added successfully!")
	return nil
}

func promptForBookmarkURL() (string, error) {
	prompt := promptui.Prompt{
		Label: "URL",
		Validate: func(input string) error {
			if _, err := bookmark.NewBookmarkURL(input); err != nil {
				return err
			}
			return nil
		},
	}
	return prompt.Run()
}

func promptForBookmarkTitle() (string, error) {
	prompt := promptui.Prompt{
		Label: "Title",
		Validate: func(input string) error {
			if _, err := bookmark.NewBookmarkTitle(input); err != nil {
				return err
			}
			return nil
		},
	}
	return prompt.Run()
}

func promptForBookmarkDescription() (string, error) {
	prompt := promptui.Prompt{
		Label: "Description",
	}
	return prompt.Run()
}

func promptForBookmarkTags() ([]string, error) {
	prompt := promptui.Prompt{
		Label: "Tags (comma-separated)",
		Validate: func(input string) error {
			if strings.TrimSpace(input) == "" {
				return nil
			}
			tags := strings.Split(input, ",")
			for i, tag := range tags {
				if _, err := bookmark.NewBookmarkTag(tag); err != nil {
					return fmt.Errorf("invalid tag at position %d: %w", i+1, err)
				}
			}
			return nil
		},
	}
	result, err := prompt.Run()
	if err != nil {
		return nil, err
	}

	if strings.TrimSpace(result) == "" {
		return []string{}, nil
	}

	tags := strings.Split(result, ",")
	return tags, nil
}

func promptForBookmark() (usecase.AddBookmarkInput, error) {
	url, err := promptForBookmarkURL()
	if err != nil {
		return usecase.AddBookmarkInput{}, err
	}
	title, err := promptForBookmarkTitle()
	if err != nil {
		return usecase.AddBookmarkInput{}, err
	}
	description, err := promptForBookmarkDescription()
	if err != nil {
		return usecase.AddBookmarkInput{}, err
	}
	tags, err := promptForBookmarkTags()
	if err != nil {
		return usecase.AddBookmarkInput{}, err
	}

	return usecase.AddBookmarkInput{
		URL:         url,
		Title:       title,
		Description: description,
		Tags:        tags,
	}, nil
}
