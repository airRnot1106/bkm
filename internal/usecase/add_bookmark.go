package usecase

import (
	"fmt"

	"github.com/airRnot1106/bkm/internal/bookmark"
)

type AddBookmarkInput struct {
	URL         string
	Title       string
	Description string
	Tags        []string
}

type AddBookmark struct {
	repo bookmark.Repository
}

func NewAddBookmark(repo bookmark.Repository) *AddBookmark {
	return &AddBookmark{repo: repo}
}

func (uc *AddBookmark) Execute(input AddBookmarkInput) (bookmark.Bookmark, error) {
	url, err := bookmark.NewBookmarkURL(input.URL)
	if err != nil {
		return bookmark.Bookmark{}, fmt.Errorf("invalid URL: %w", err)
	}

	title, err := bookmark.NewBookmarkTitle(input.Title)
	if err != nil {
		return bookmark.Bookmark{}, fmt.Errorf("invalid title: %w", err)
	}

	desc := bookmark.NewBookmarkDescription(input.Description)

	tags := make([]bookmark.BookmarkTag, 0, len(input.Tags))
	for i, t := range input.Tags {
		tag, err := bookmark.NewBookmarkTag(t)
		if err != nil {
			return bookmark.Bookmark{}, fmt.Errorf("invalid tag at index %d: %w", i, err)
		}
		tags = append(tags, tag)
	}

	bm := bookmark.CreateBookmark(url, title, desc, tags)

	if err := uc.repo.Add(bm); err != nil {
		return bookmark.Bookmark{}, fmt.Errorf("failed to add bookmark: %w", err)
	}

	return bm, nil
}
