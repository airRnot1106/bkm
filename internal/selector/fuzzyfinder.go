package selector

import (
	"errors"
	"fmt"
	"strings"

	"github.com/airRnot1106/bkm/internal/bookmark"
	"github.com/ktr0731/go-fuzzyfinder"
)

type FuzzyFinderSelector struct{}

var _ Selector = (*FuzzyFinderSelector)(nil)

func NewFuzzyFinderSelector() *FuzzyFinderSelector {
	return &FuzzyFinderSelector{}
}

func (s *FuzzyFinderSelector) Select(bookmarks []bookmark.Bookmark) (bookmark.Bookmark, error) {
	if len(bookmarks) == 0 {
		return bookmark.Bookmark{}, fmt.Errorf("no bookmarks to select from")
	}

	idx, err := fuzzyfinder.Find(
		bookmarks,
		func(i int) string {
			return formatBookmarkForDisplay(bookmarks[i])
		},
		fuzzyfinder.WithPreviewWindow(func(i, w, h int) string {
			return formatBookmarkForPreview(bookmarks[i])
		}),
	)
	if err != nil {
		if errors.Is(err, fuzzyfinder.ErrAbort) {
			return bookmark.Bookmark{}, ErrCancelled
		}
		return bookmark.Bookmark{}, fmt.Errorf("fuzzy finder error: %w", err)
	}

	return bookmarks[idx], nil
}

func formatTagsAsCommaSeparated(tags []bookmark.BookmarkTag) string {
	tagNames := make([]string, len(tags))
	for i, tag := range tags {
		tagNames[i] = tag.Value()
	}
	return strings.Join(tagNames, ",")
}

func formatBookmarkForDisplay(b bookmark.Bookmark) string {
	tags := formatTagsAsCommaSeparated(b.Tags)
	return fmt.Sprintf("%s | %s | %s | %s", b.Title.Value(), b.URL.Value(), tags, b.Description.Value())
}

func formatBookmarkForPreview(b bookmark.Bookmark) string {
	return fmt.Sprintf("%s\n\nURL: %s\nDescription: %s\nTags: %s",
		b.Title.Value(),
		b.URL.Value(),
		b.Description.Value(),
		formatTagsAsCommaSeparated(b.Tags))
}
