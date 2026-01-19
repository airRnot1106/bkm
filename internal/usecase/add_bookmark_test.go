package usecase_test

import (
	"fmt"
	"testing"

	"github.com/airRnot1106/bkm/internal/bookmark"
	"github.com/airRnot1106/bkm/internal/usecase"
)

type mockRepositoryForAdd struct {
	addFunc   func(bookmark.Bookmark) error
	listFunc  func() ([]bookmark.Bookmark, error)
	bookmarks []bookmark.Bookmark
}

func (m *mockRepositoryForAdd) Add(bm bookmark.Bookmark) error {
	if m.addFunc != nil {
		return m.addFunc(bm)
	}
	m.bookmarks = append(m.bookmarks, bm)
	return nil
}

func (m *mockRepositoryForAdd) List() ([]bookmark.Bookmark, error) {
	if m.listFunc != nil {
		return m.listFunc()
	}
	return m.bookmarks, nil
}

func (m *mockRepositoryForAdd) Delete(id bookmark.BookmarkID) error {
	return fmt.Errorf("not implemented")
}

func TestAddBookmark_ValidParamsAlwaysSucceed(t *testing.T) {
	repo := &mockRepositoryForAdd{}
	uc := usecase.NewAddBookmark(repo)

	input := usecase.AddBookmarkInput{
		URL:         "https://example.com",
		Title:       "Example",
		Description: "An example bookmark",
		Tags:        []string{"tag1", "tag2"},
	}

	bm, err := uc.Execute(input)
	if err != nil {
		t.Fatalf("expected success, got error: %v", err)
	}

	if len(repo.bookmarks) != 1 {
		t.Fatalf("expected 1 bookmark, got %d", len(repo.bookmarks))
	}

	if bm.URL.Value() != input.URL {
		t.Errorf("expected URL %s, got %s", input.URL, bm.URL.Value())
	}
	if bm.Title.Value() != input.Title {
		t.Errorf("expected Title %s, got %s", input.Title, bm.Title.Value())
	}
	if bm.Description.Value() != input.Description {
		t.Errorf("expected Description %s, got %s", input.Description, bm.Description.Value())
	}
	if len(bm.Tags) != len(input.Tags) {
		t.Errorf("expected %d tags, got %d", len(input.Tags), len(bm.Tags))
	}
	for i, tag := range bm.Tags {
		if tag.Value() != input.Tags[i] {
			t.Errorf("expected tag %s, got %s", input.Tags[i], tag.Value())
		}
	}
}

func TestAddBookmark_InvalidURLAlwaysFails(t *testing.T) {
	repo := &mockRepositoryForAdd{}
	uc := usecase.NewAddBookmark(repo)

	input := usecase.AddBookmarkInput{
		URL:         "invalid-url",
		Title:       "Example",
		Description: "An example bookmark",
		Tags:        []string{"tag1", "tag2"},
	}

	_, err := uc.Execute(input)
	if err == nil {
		t.Fatalf("expected error for invalid URL, got success")
	}
}

func TestAddBookmark_InvalidTitleAlwaysFails(t *testing.T) {
	repo := &mockRepositoryForAdd{}
	uc := usecase.NewAddBookmark(repo)

	input := usecase.AddBookmarkInput{
		URL:         "https://example.com",
		Title:       "",
		Description: "An example bookmark",
		Tags:        []string{"tag1", "tag2"},
	}

	_, err := uc.Execute(input)
	if err == nil {
		t.Fatalf("expected error for invalid Title, got success")
	}
}

func TestAddBookmark_InvalidTagAlwaysFails(t *testing.T) {
	repo := &mockRepositoryForAdd{}
	uc := usecase.NewAddBookmark(repo)

	input := usecase.AddBookmarkInput{
		URL:         "https://example.com",
		Title:       "Example",
		Description: "An example bookmark",
		Tags:        []string{"tag1", ""},
	}

	_, err := uc.Execute(input)
	if err == nil {
		t.Fatalf("expected error for invalid Tag, got success")
	}
}

func TestAddBookmark_EmptyTagsSucceed(t *testing.T) {
	repo := &mockRepositoryForAdd{}
	uc := usecase.NewAddBookmark(repo)

	input := usecase.AddBookmarkInput{
		URL:         "https://example.com",
		Title:       "Example",
		Description: "An example bookmark",
		Tags:        []string{},
	}

	bm, err := uc.Execute(input)
	if err != nil {
		t.Fatalf("expected success for empty tags, got error: %v", err)
	}

	if len(repo.bookmarks) != 1 {
		t.Fatalf("expected 1 bookmark, got %d", len(repo.bookmarks))
	}

	if bm.URL.Value() != input.URL {
		t.Errorf("expected URL %s, got %s", input.URL, bm.URL.Value())
	}
	if bm.Title.Value() != input.Title {
		t.Errorf("expected Title %s, got %s", input.Title, bm.Title.Value())
	}
	if bm.Description.Value() != input.Description {
		t.Errorf("expected Description %s, got %s", input.Description, bm.Description.Value())
	}
	if len(bm.Tags) != len(input.Tags) {
		t.Errorf("expected %d tags, got %d", len(input.Tags), len(bm.Tags))
	}
	for i, tag := range bm.Tags {
		if tag.Value() != input.Tags[i] {
			t.Errorf("expected tag %s, got %s", input.Tags[i], tag.Value())
		}
	}
}

func TestAddBookmark_RepositoryAddFails(t *testing.T) {
	repo := &mockRepositoryForAdd{
		addFunc: func(bm bookmark.Bookmark) error {
			return fmt.Errorf("repository add error")
		},
	}
	uc := usecase.NewAddBookmark(repo)

	input := usecase.AddBookmarkInput{
		URL:         "https://example.com",
		Title:       "Example",
		Description: "An example bookmark",
		Tags:        []string{"tag1", "tag2"},
	}

	_, err := uc.Execute(input)
	if err == nil {
		t.Fatalf("expected error from repository add, got success")
	}
}
