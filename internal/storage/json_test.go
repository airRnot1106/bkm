package storage_test

import (
	"fmt"
	"os"
	"path/filepath"
	"testing"

	"github.com/airRnot1106/bkm/internal/bookmark"
	"github.com/airRnot1106/bkm/internal/storage"
)

func TestNewDefaultJSONStorage_DefaultPath(t *testing.T) {
	st, err := storage.NewDefaultJSONStorage()
	if err != nil {
		t.Fatalf("NewDefaultJSONStorage should succeed: %v", err)
	}

	if st == nil {
		t.Fatal("storage should not be nil")
	}
}

func TestNewJSONStorage_CustomPath(t *testing.T) {
	tmpDir := t.TempDir()
	filePath := filepath.Join(tmpDir, "test_bookmarks.json")

	_, err := storage.NewJSONStorage(filePath)
	if err != nil {
		t.Fatalf("NewJSONStorage should succeed: %v", err)
	}

	if _, err := os.Stat(tmpDir); os.IsNotExist(err) {
		t.Fatal("directory should be created")
	}
}

func TestJSONStorage_AddAndList(t *testing.T) {
	tmpDir := t.TempDir()
	filePath := filepath.Join(tmpDir, "bookmarks.json")
	st, err := storage.NewJSONStorage(filePath)
	if err != nil {
		t.Fatalf("setup failed: %v", err)
	}

	url, _ := bookmark.NewBookmarkURL("https://example.com")
	title, _ := bookmark.NewBookmarkTitle("Example")
	desc := bookmark.NewBookmarkDescription("Test description")
	tag1, _ := bookmark.NewBookmarkTag("go")
	tag2, _ := bookmark.NewBookmarkTag("test")

	bm := bookmark.CreateBookmark(url, title, desc, []bookmark.BookmarkTag{tag1, tag2})

	err = st.Add(bm)
	if err != nil {
		t.Fatalf("Add should succeed: %v", err)
	}

	bookmarks, err := st.List()
	if err != nil {
		t.Fatalf("List should succeed: %v", err)
	}

	if len(bookmarks) != 1 {
		t.Fatalf("expected 1 bookmark, got %d", len(bookmarks))
	}

	retrieved := bookmarks[0]
	if retrieved.URL.Value() != bm.URL.Value() {
		t.Errorf("URL mismatch: expected %q, got %q", bm.URL.Value(), retrieved.URL.Value())
	}
	if retrieved.Title.Value() != bm.Title.Value() {
		t.Errorf("Title mismatch: expected %q, got %q", bm.Title.Value(), retrieved.Title.Value())
	}
}

func TestJSONStorage_MultipleBookmarks(t *testing.T) {
	tmpDir := t.TempDir()
	filePath := filepath.Join(tmpDir, "bookmarks.json")
	st, err := storage.NewJSONStorage(filePath)
	if err != nil {
		t.Fatalf("setup failed: %v", err)
	}

	for i := 1; i <= 3; i++ {
		url, _ := bookmark.NewBookmarkURL(fmt.Sprintf("https://example%d.com", i))
		title, _ := bookmark.NewBookmarkTitle(fmt.Sprintf("Example %d", i))
		desc := bookmark.NewBookmarkDescription("")
		bm := bookmark.CreateBookmark(url, title, desc, nil)

		err = st.Add(bm)
		if err != nil {
			t.Fatalf("Add bookmark %d failed: %v", i, err)
		}
	}

	bookmarks, err := st.List()
	if err != nil {
		t.Fatalf("List failed: %v", err)
	}

	if len(bookmarks) != 3 {
		t.Fatalf("expected 3 bookmarks, got %d", len(bookmarks))
	}
}

func TestJSONStorage_ListEmpty(t *testing.T) {
	tmpDir := t.TempDir()
	filePath := filepath.Join(tmpDir, "bookmarks.json")
	st, err := storage.NewJSONStorage(filePath)
	if err != nil {
		t.Fatalf("setup failed: %v", err)
	}

	bookmarks, err := st.List()
	if err != nil {
		t.Fatalf("List should succeed: %v", err)
	}

	if len(bookmarks) != 0 {
		t.Fatalf("expected 0 bookmarks, got %d", len(bookmarks))
	}
}
