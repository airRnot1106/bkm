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

	addCmd.Flags().StringP("url", "u", "", "URL of the bookmark")
	addCmd.Flags().StringP("title", "t", "", "Title of the bookmark")
	addCmd.Flags().StringP("description", "d", "", "Description of the bookmark")
	addCmd.Flags().StringSliceP("tags", "T", []string{}, "Tags (comma-separated)")
}

func runAdd(cmd *cobra.Command, args []string) error {
	flagsProvided := cmd.Flags().Changed("url") ||
		cmd.Flags().Changed("title") ||
		cmd.Flags().Changed("description") ||
		cmd.Flags().Changed("tags")

	var input usecase.AddBookmarkInput

	if flagsProvided {
		url, err := cmd.Flags().GetString("url")
		if err != nil {
			return fmt.Errorf("failed to get url flag: %w", err)
		}
		title, err := cmd.Flags().GetString("title")
		if err != nil {
			return fmt.Errorf("failed to get title flag: %w", err)
		}
		description, err := cmd.Flags().GetString("description")
		if err != nil {
			return fmt.Errorf("failed to get description flag: %w", err)
		}
		tags, err := cmd.Flags().GetStringSlice("tags")
		if err != nil {
			return fmt.Errorf("failed to get tags flag: %w", err)
		}

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

	repo, err := storage.NewDefaultJSONStorage()
	if err != nil {
		return fmt.Errorf("failed to initialize storage: %w", err)
	}

	uc := usecase.NewAddBookmark(repo)
	bm, err := uc.Execute(input)
	if err != nil {
		return fmt.Errorf("failed to add bookmark: %w", err)
	}

	fmt.Println("✓ Bookmark added successfully!")
	fmt.Println()
	fmt.Printf("  URL:         %s\n", bm.URL.Value())
	fmt.Printf("  Title:       %s\n", bm.Title.Value())
	if desc := bm.Description.Value(); desc != "" {
		fmt.Printf("  Description: %s\n", desc)
	}
	if len(bm.Tags) > 0 {
		tagStrs := make([]string, len(bm.Tags))
		for i, tag := range bm.Tags {
			tagStrs[i] = tag.Value()
		}
		fmt.Printf("  Tags:        %s\n", strings.Join(tagStrs, ", "))
	}
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
