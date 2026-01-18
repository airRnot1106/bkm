package selector_test

import (
	"testing"

	"github.com/airRnot1106/bkm/internal/bookmark"
	"github.com/airRnot1106/bkm/internal/selector"
)

func TestNewFuzzyFinderSelector(t *testing.T) {
	fz := selector.NewFuzzyFinderSelector()
	if fz == nil {
		t.Fatal("FuzzyFinderSelector should not be nil")
	}
}

func TestFuzzyFinderSelector_SelectEmptyBookmarksFails(t *testing.T) {
	fz := selector.NewFuzzyFinderSelector()
	_, err := fz.Select([]bookmark.Bookmark{})
	if err == nil {
		t.Fatal("Selecting from empty bookmarks should return an error")
	}
}
