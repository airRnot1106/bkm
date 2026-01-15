package usecase

import (
	"fmt"

	"github.com/airRnot1106/bkm/internal/bookmark"
	"github.com/airRnot1106/bkm/internal/selector"
)

type SearchBookmarkInput struct {
	Tags []string
}

type SearchBookmark struct {
	repo     bookmark.Repository
	selector selector.Selector
}

func NewSearchBookmark(repo bookmark.Repository, selector selector.Selector) *SearchBookmark {
	return &SearchBookmark{repo: repo, selector: selector}
}

func (uc *SearchBookmark) Execute(input SearchBookmarkInput) (bookmark.Bookmark, error) {
	targetTags := make([]bookmark.BookmarkTag, 0, len(input.Tags))
	for i, t := range input.Tags {
		tag, err := bookmark.NewBookmarkTag(t)
		if err != nil {
			return bookmark.Bookmark{}, fmt.Errorf("invalid tag at index %d: %w", i, err)
		}
		targetTags = append(targetTags, tag)
	}

	bookmarks, err := uc.repo.List()
	if err != nil {
		return bookmark.Bookmark{}, fmt.Errorf("failed to list bookmarks: %w", err)
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

	bm, err := uc.selector.Select(bookmarksFilteredByTags)
	if err != nil {
		if err == selector.ErrCancelled {
			return bookmark.Bookmark{}, nil
		}
		return bookmark.Bookmark{}, fmt.Errorf("failed to select bookmark: %w", err)
	}

	return bm, nil
}
