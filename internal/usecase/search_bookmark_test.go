package usecase_test

import (
	"fmt"
	"strings"
	"testing"

	"github.com/airRnot1106/bkm/internal/bookmark"
	"github.com/airRnot1106/bkm/internal/selector"
	"github.com/airRnot1106/bkm/internal/usecase"
)

type mockRepository struct {
	addFunc   func(bookmark.Bookmark) error
	listFunc  func() ([]bookmark.Bookmark, error)
	bookmarks []bookmark.Bookmark
}

func (m *mockRepository) Add(bm bookmark.Bookmark) error {
	if m.addFunc != nil {
		return m.addFunc(bm)
	}
	m.bookmarks = append(m.bookmarks, bm)
	return nil
}

func (m *mockRepository) List() ([]bookmark.Bookmark, error) {
	if m.listFunc != nil {
		return m.listFunc()
	}
	return m.bookmarks, nil
}

type mockSelector struct {
	selectFunc func([]bookmark.Bookmark) (bookmark.Bookmark, error)
}

func (m *mockSelector) Select(bms []bookmark.Bookmark) (bookmark.Bookmark, error) {
	if m.selectFunc != nil {
		return m.selectFunc(bms)
	}
	if len(bms) == 0 {
		return bookmark.Bookmark{}, selector.ErrCancelled
	}
	return bms[0], nil
}

func TestSearchBookmark_ValidParamsAlwaysSucceed(t *testing.T) {
	repo := &mockRepository{}
	sel := &mockSelector{}
	uc := usecase.NewSearchBookmark(repo, sel)

	var bms []bookmark.Bookmark
	for i := 1; i <= 5; i++ {
		url, _ := bookmark.NewBookmarkURL(fmt.Sprintf("https://example.com/page%d", i))
		title, _ := bookmark.NewBookmarkTitle(fmt.Sprintf("Page %d", i))
		desc := bookmark.NewBookmarkDescription(fmt.Sprintf("Description for page %d", i))
		tags := []bookmark.BookmarkTag{}
		if i%2 == 0 {
			tagEven, _ := bookmark.NewBookmarkTag("even")
			tags = append(tags, tagEven)
		} else {
			tagOdd, _ := bookmark.NewBookmarkTag("odd")
			tags = append(tags, tagOdd)
		}
		bm := bookmark.CreateBookmark(url, title, desc, tags)
		bms = append(bms, bm)
		repo.Add(bm)
	}

	input := usecase.SearchBookmarkInput{
		Tags: []string{"even"},
	}

	bm, err := uc.Execute(input)
	if err != nil {
		t.Fatalf("expected success, got error: %v", err)
	}

	found := false
	for _, b := range bms {
		if b.URL.Value() == bm.URL.Value() {
			found = true
			break
		}
	}
	if !found {
		t.Errorf("returned bookmark not found in repository")
	}
}

func TestSearchBookmark_NoMatchingBookmarks(t *testing.T) {
	repo := &mockRepository{}
	sel := &mockSelector{}
	uc := usecase.NewSearchBookmark(repo, sel)

	url, _ := bookmark.NewBookmarkURL("https://example.com/page1")
	title, _ := bookmark.NewBookmarkTitle("Page 1")
	desc := bookmark.NewBookmarkDescription("Description for page 1")
	tagOdd, _ := bookmark.NewBookmarkTag("odd")
	bm := bookmark.CreateBookmark(url, title, desc, []bookmark.BookmarkTag{tagOdd})
	repo.Add(bm)

	input := usecase.SearchBookmarkInput{
		Tags: []string{"even"},
	}

	_, err := uc.Execute(input)
	if err == nil {
		t.Fatalf("expected error, got success")
	}
}

func TestSearchBookmark_InvalidTag(t *testing.T) {
	repo := &mockRepository{}
	sel := &mockSelector{}
	uc := usecase.NewSearchBookmark(repo, sel)

	tests := []struct {
		name          string
		tags          []string
		expectedIndex int
	}{
		{
			name:          "empty tag at index 0",
			tags:          []string{""},
			expectedIndex: 0,
		},
		{
			name:          "empty tag at index 1",
			tags:          []string{"valid", ""},
			expectedIndex: 1,
		},
		{
			name:          "whitespace only tag at index 2",
			tags:          []string{"valid1", "valid2", "   "},
			expectedIndex: 2,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			input := usecase.SearchBookmarkInput{
				Tags: tt.tags,
			}

			_, err := uc.Execute(input)
			if err == nil {
				t.Fatalf("expected error, got success")
			}

			expectedMsg := fmt.Sprintf("invalid tag at index %d", tt.expectedIndex)
			if !strings.Contains(err.Error(), expectedMsg) {
				t.Errorf("expected error message to contain %q, got %q", expectedMsg, err.Error())
			}
		})
	}
}

func TestSearchBookmark_RepositoryListError(t *testing.T) {
	expectedErr := fmt.Errorf("database connection failed")
	repo := &mockRepository{
		listFunc: func() ([]bookmark.Bookmark, error) {
			return nil, expectedErr
		},
	}
	sel := &mockSelector{}
	uc := usecase.NewSearchBookmark(repo, sel)

	input := usecase.SearchBookmarkInput{
		Tags: []string{"test"},
	}

	_, err := uc.Execute(input)
	if err == nil {
		t.Fatalf("expected error, got success")
	}

	expectedMsg := "failed to list bookmarks"
	if !strings.Contains(err.Error(), expectedMsg) {
		t.Errorf("expected error message to contain %q, got %q", expectedMsg, err.Error())
	}
}
