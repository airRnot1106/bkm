package usecase_test

import (
	"fmt"
	"testing"

	"github.com/airRnot1106/bkm/internal/bookmark"
	"github.com/airRnot1106/bkm/internal/usecase"
)

type mockOpenerForOpener struct {
	openFunc func(bookmark.Bookmark) error
}

func (m *mockOpenerForOpener) Open(bm bookmark.Bookmark) error {
	if m.openFunc != nil {
		return m.openFunc(bm)
	}
	return nil
}

func TestOpenBookmark_Success(t *testing.T) {
	opener := &mockOpenerForOpener{}
	uc := usecase.NewOpenBookmark(opener)

	url, _ := bookmark.NewBookmarkURL("https://example.com")
	title, _ := bookmark.NewBookmarkTitle("Example")
	desc := bookmark.NewBookmarkDescription("Example description")
	bm := bookmark.CreateBookmark(url, title, desc, []bookmark.BookmarkTag{})

	input := usecase.OpenBookmarkInput{
		Bookmark: bm,
	}

	err := uc.Execute(input)
	if err != nil {
		t.Fatalf("expected success, got error: %v", err)
	}
}

func TestOpenBookmark_OpenerError(t *testing.T) {
	expectedErr := fmt.Errorf("failed to open browser")
	opener := &mockOpenerForOpener{
		openFunc: func(bm bookmark.Bookmark) error {
			return expectedErr
		},
	}
	uc := usecase.NewOpenBookmark(opener)

	url, _ := bookmark.NewBookmarkURL("https://example.com")
	title, _ := bookmark.NewBookmarkTitle("Example")
	desc := bookmark.NewBookmarkDescription("Example description")
	bm := bookmark.CreateBookmark(url, title, desc, []bookmark.BookmarkTag{})

	input := usecase.OpenBookmarkInput{
		Bookmark: bm,
	}

	err := uc.Execute(input)
	if err == nil {
		t.Fatalf("expected error, got success")
	}

	if err != expectedErr {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}
