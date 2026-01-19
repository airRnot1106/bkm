package usecase

import (
	"fmt"
	"slices"

	"github.com/airRnot1106/bkm/internal/bookmark"
	"github.com/airRnot1106/bkm/internal/selector"
)

type DeleteBookmarkInput struct {
	Tags []string
}

type DeleteBookmark struct {
	repo     bookmark.Repository
	selector selector.Selector
}

func NewDeleteBookmark(repo bookmark.Repository, selector selector.Selector) *DeleteBookmark {
	return &DeleteBookmark{repo: repo, selector: selector}
}

func (uc *DeleteBookmark) Execute(input DeleteBookmarkInput) error {
	targetTags := make([]bookmark.BookmarkTag, 0, len(input.Tags))
	for i, t := range input.Tags {
		tag, err := bookmark.NewBookmarkTag(t)
		if err != nil {
			return fmt.Errorf("invalid tag at index %d: %w", i, err)
		}
		targetTags = append(targetTags, tag)
	}

	bookmarks, err := uc.repo.List()
	if err != nil {
		return fmt.Errorf("failed to list bookmarks: %w", err)
	}

	// Filter bookmarks by tags
	var bookmarksFilteredByTags []bookmark.Bookmark
	for _, bm := range bookmarks {
		tagSet := make(map[string]struct{}, len(bm.Tags))
		for _, tag := range bm.Tags {
			tagSet[tag.Value()] = struct{}{}
		}

		matched := true
		for _, target := range targetTags {
			if _, ok := tagSet[target.Value()]; !ok {
				matched = false
				break
			}
		}

		if matched {
			bookmarksFilteredByTags = append(bookmarksFilteredByTags, bm)
		}
	}

	targetBookmark, err := uc.selector.Select(bookmarksFilteredByTags)
	if err != nil {
		return err
	}

	hasTargetBookmark := slices.ContainsFunc(bookmarks, func(bm bookmark.Bookmark) bool {
		return bm.ID.Value() == targetBookmark.ID.Value()
	})

	if !hasTargetBookmark {
		return fmt.Errorf("bookmark with ID %s not found", targetBookmark.ID.Value())
	}

	err = uc.repo.Delete(targetBookmark.ID)
	if err != nil {
		return fmt.Errorf("failed to delete bookmark: %w", err)
	}

	return nil
}
