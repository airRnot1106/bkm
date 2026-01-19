package usecase_test

import (
	"fmt"
	"strings"
	"testing"

	"github.com/airRnot1106/bkm/internal/bookmark"
	"github.com/airRnot1106/bkm/internal/selector"
	"github.com/airRnot1106/bkm/internal/usecase"
)

type mockRepositoryForDelete struct {
	addFunc    func(bookmark.Bookmark) error
	listFunc   func() ([]bookmark.Bookmark, error)
	deleteFunc func(bookmark.BookmarkID) error
	bookmarks  []bookmark.Bookmark
}

func (m *mockRepositoryForDelete) Add(bm bookmark.Bookmark) error {
	if m.addFunc != nil {
		return m.addFunc(bm)
	}
	m.bookmarks = append(m.bookmarks, bm)
	return nil
}

func (m *mockRepositoryForDelete) List() ([]bookmark.Bookmark, error) {
	if m.listFunc != nil {
		return m.listFunc()
	}
	return m.bookmarks, nil
}

func (m *mockRepositoryForDelete) Delete(id bookmark.BookmarkID) error {
	if m.deleteFunc != nil {
		return m.deleteFunc(id)
	}
	return fmt.Errorf("not implemented")
}

type mockSelectorForDelete struct {
	selectFunc func([]bookmark.Bookmark) (bookmark.Bookmark, error)
}

func (m *mockSelectorForDelete) Select(bms []bookmark.Bookmark) (bookmark.Bookmark, error) {
	if m.selectFunc != nil {
		return m.selectFunc(bms)
	}
	if len(bms) == 0 {
		return bookmark.Bookmark{}, selector.ErrCancelled
	}
	return bms[0], nil
}

func TestDeleteBookmark_Success(t *testing.T) {
	repo := &mockRepositoryForDelete{}
	sel := &mockSelectorForDelete{}
	uc := usecase.NewDeleteBookmark(repo, sel)

	// Add test bookmarks
	var bms []bookmark.Bookmark
	for i := 1; i <= 3; i++ {
		url, _ := bookmark.NewBookmarkURL(fmt.Sprintf("https://example.com/page%d", i))
		title, _ := bookmark.NewBookmarkTitle(fmt.Sprintf("Page %d", i))
		desc := bookmark.NewBookmarkDescription(fmt.Sprintf("Description for page %d", i))
		tag, _ := bookmark.NewBookmarkTag("test")
		bm := bookmark.CreateBookmark(url, title, desc, []bookmark.BookmarkTag{tag})
		bms = append(bms, bm)
		repo.Add(bm)
	}

	deleted := false
	var deletedID bookmark.BookmarkID
	repo.deleteFunc = func(id bookmark.BookmarkID) error {
		deleted = true
		deletedID = id
		return nil
	}

	input := usecase.DeleteBookmarkInput{
		Tags: []string{"test"},
	}

	err := uc.Execute(input)
	if err != nil {
		t.Fatalf("expected success, got error: %v", err)
	}

	if !deleted {
		t.Errorf("expected bookmark to be deleted")
	}

	if deletedID.Value() != bms[0].ID.Value() {
		t.Errorf("expected to delete bookmark with ID %s, got %s", bms[0].ID.Value(), deletedID.Value())
	}
}

func TestDeleteBookmark_InvalidTag(t *testing.T) {
	repo := &mockRepositoryForDelete{}
	sel := &mockSelectorForDelete{}
	uc := usecase.NewDeleteBookmark(repo, sel)

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
			input := usecase.DeleteBookmarkInput{
				Tags: tt.tags,
			}

			err := uc.Execute(input)
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

func TestDeleteBookmark_RepositoryListError(t *testing.T) {
	expectedErr := fmt.Errorf("database connection failed")
	repo := &mockRepositoryForDelete{
		listFunc: func() ([]bookmark.Bookmark, error) {
			return nil, expectedErr
		},
	}
	sel := &mockSelectorForDelete{}
	uc := usecase.NewDeleteBookmark(repo, sel)

	input := usecase.DeleteBookmarkInput{
		Tags: []string{"test"},
	}

	err := uc.Execute(input)
	if err == nil {
		t.Fatalf("expected error, got success")
	}

	expectedMsg := "failed to list bookmarks"
	if !strings.Contains(err.Error(), expectedMsg) {
		t.Errorf("expected error message to contain %q, got %q", expectedMsg, err.Error())
	}
}

func TestDeleteBookmark_NoMatchingBookmarks(t *testing.T) {
	repo := &mockRepositoryForDelete{}
	sel := &mockSelectorForDelete{}
	uc := usecase.NewDeleteBookmark(repo, sel)

	url, _ := bookmark.NewBookmarkURL("https://example.com/page1")
	title, _ := bookmark.NewBookmarkTitle("Page 1")
	desc := bookmark.NewBookmarkDescription("Description for page 1")
	tagOdd, _ := bookmark.NewBookmarkTag("odd")
	bm := bookmark.CreateBookmark(url, title, desc, []bookmark.BookmarkTag{tagOdd})
	repo.Add(bm)

	input := usecase.DeleteBookmarkInput{
		Tags: []string{"even"},
	}

	err := uc.Execute(input)
	if err == nil {
		t.Fatalf("expected error, got success")
	}

	// Selector should return ErrCancelled when no bookmarks match
	if err != selector.ErrCancelled {
		t.Errorf("expected selector.ErrCancelled, got %v", err)
	}
}

func TestDeleteBookmark_SelectorError(t *testing.T) {
	repo := &mockRepositoryForDelete{}
	expectedErr := fmt.Errorf("user cancelled selection")
	sel := &mockSelectorForDelete{
		selectFunc: func(bms []bookmark.Bookmark) (bookmark.Bookmark, error) {
			return bookmark.Bookmark{}, expectedErr
		},
	}
	uc := usecase.NewDeleteBookmark(repo, sel)

	url, _ := bookmark.NewBookmarkURL("https://example.com/page1")
	title, _ := bookmark.NewBookmarkTitle("Page 1")
	desc := bookmark.NewBookmarkDescription("Description for page 1")
	tag, _ := bookmark.NewBookmarkTag("test")
	bm := bookmark.CreateBookmark(url, title, desc, []bookmark.BookmarkTag{tag})
	repo.Add(bm)

	input := usecase.DeleteBookmarkInput{
		Tags: []string{"test"},
	}

	err := uc.Execute(input)
	if err == nil {
		t.Fatalf("expected error, got success")
	}

	if err != expectedErr {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestDeleteBookmark_BookmarkNotFound(t *testing.T) {
	repo := &mockRepositoryForDelete{}

	// Add a bookmark to the repository
	url, _ := bookmark.NewBookmarkURL("https://example.com/page1")
	title, _ := bookmark.NewBookmarkTitle("Page 1")
	desc := bookmark.NewBookmarkDescription("Description for page 1")
	tag, _ := bookmark.NewBookmarkTag("test")
	bm := bookmark.CreateBookmark(url, title, desc, []bookmark.BookmarkTag{tag})
	repo.Add(bm)

	// Create a different bookmark that doesn't exist in the repository
	url2, _ := bookmark.NewBookmarkURL("https://example.com/page2")
	title2, _ := bookmark.NewBookmarkTitle("Page 2")
	desc2 := bookmark.NewBookmarkDescription("Description for page 2")
	tag2, _ := bookmark.NewBookmarkTag("test")
	nonExistentBm := bookmark.CreateBookmark(url2, title2, desc2, []bookmark.BookmarkTag{tag2})

	// Mock selector to return the non-existent bookmark
	sel := &mockSelectorForDelete{
		selectFunc: func(bms []bookmark.Bookmark) (bookmark.Bookmark, error) {
			return nonExistentBm, nil
		},
	}
	uc := usecase.NewDeleteBookmark(repo, sel)

	input := usecase.DeleteBookmarkInput{
		Tags: []string{"test"},
	}

	err := uc.Execute(input)
	if err == nil {
		t.Fatalf("expected error, got success")
	}

	expectedMsg := "not found"
	if !strings.Contains(err.Error(), expectedMsg) {
		t.Errorf("expected error message to contain %q, got %q", expectedMsg, err.Error())
	}
}

func TestDeleteBookmark_RepositoryDeleteError(t *testing.T) {
	repo := &mockRepositoryForDelete{}
	sel := &mockSelectorForDelete{}
	uc := usecase.NewDeleteBookmark(repo, sel)

	url, _ := bookmark.NewBookmarkURL("https://example.com/page1")
	title, _ := bookmark.NewBookmarkTitle("Page 1")
	desc := bookmark.NewBookmarkDescription("Description for page 1")
	tag, _ := bookmark.NewBookmarkTag("test")
	bm := bookmark.CreateBookmark(url, title, desc, []bookmark.BookmarkTag{tag})
	repo.Add(bm)

	expectedErr := fmt.Errorf("failed to delete from database")
	repo.deleteFunc = func(id bookmark.BookmarkID) error {
		return expectedErr
	}

	input := usecase.DeleteBookmarkInput{
		Tags: []string{"test"},
	}

	err := uc.Execute(input)
	if err == nil {
		t.Fatalf("expected error, got success")
	}

	expectedMsg := "failed to delete bookmark"
	if !strings.Contains(err.Error(), expectedMsg) {
		t.Errorf("expected error message to contain %q, got %q", expectedMsg, err.Error())
	}
}
