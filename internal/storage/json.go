package storage

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/adrg/xdg"
	"github.com/airRnot1106/bkm/internal/bookmark"
)

type bookmarkJSON struct {
	ID          string    `json:"id"`
	URL         string    `json:"url"`
	Title       string    `json:"title"`
	Description string    `json:"description,omitempty"`
	Tags        []string  `json:"tags,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type JSONStorage struct {
	filePath string
}

var _ bookmark.Repository = (*JSONStorage)(nil)

func NewDefaultJSONStorage() (*JSONStorage, error) {
	dataDir := filepath.Join(xdg.DataHome, "bkm")
	filePath := filepath.Join(dataDir, "bookmarks.json")
	return newJSONStorage(filePath)
}

func NewJSONStorage(filePath string) (*JSONStorage, error) {
	return newJSONStorage(filePath)
}

func newJSONStorage(filePath string) (*JSONStorage, error) {
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0o750); err != nil {
		return nil, fmt.Errorf("failed to create data directory: %w", err)
	}
	return &JSONStorage{filePath: filePath}, nil
}

func (s *JSONStorage) Add(bm bookmark.Bookmark) error {
	bookmarks, err := s.List()
	if err != nil && !errors.Is(err, os.ErrNotExist) {
		return fmt.Errorf("failed to read existing bookmarks: %w", err)
	}

	bookmarks = append(bookmarks, bm)

	dtos := make([]bookmarkJSON, len(bookmarks))
	for i, b := range bookmarks {
		dtos[i] = toDTO(b)
	}

	data, err := json.MarshalIndent(dtos, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal bookmarks: %w", err)
	}

	if err := os.WriteFile(s.filePath, data, 0o600); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}

	return nil
}

func (s *JSONStorage) List() ([]bookmark.Bookmark, error) {
	data, err := os.ReadFile(s.filePath)
	if err != nil {
		if os.IsNotExist(err) {
			return []bookmark.Bookmark{}, nil
		}
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	var dtos []bookmarkJSON
	if err := json.Unmarshal(data, &dtos); err != nil {
		return nil, fmt.Errorf("failed to unmarshal JSON: %w", err)
	}

	bookmarks := make([]bookmark.Bookmark, len(dtos))
	for i, dto := range dtos {
		bm, err := fromDTO(dto)
		if err != nil {
			return nil, fmt.Errorf("failed to convert DTO at index %d: %w", i, err)
		}
		bookmarks[i] = bm
	}

	return bookmarks, nil
}

func (s *JSONStorage) Delete(id bookmark.BookmarkID) error {
	bookmarks, err := s.List()
	if err != nil && !errors.Is(err, os.ErrNotExist) {
		return fmt.Errorf("failed to read existing bookmarks: %w", err)
	}

	var updatedBookmarks []bookmark.Bookmark
	for _, bm := range bookmarks {
		if bm.ID != id {
			updatedBookmarks = append(updatedBookmarks, bm)
		}
	}

	dtos := make([]bookmarkJSON, len(updatedBookmarks))
	for i, b := range updatedBookmarks {
		dtos[i] = toDTO(b)
	}

	data, err := json.MarshalIndent(dtos, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal bookmarks: %w", err)
	}

	if err := os.WriteFile(s.filePath, data, 0o600); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}

	return nil
}

func toDTO(bm bookmark.Bookmark) bookmarkJSON {
	tags := make([]string, len(bm.Tags))
	for i, tag := range bm.Tags {
		tags[i] = tag.Value()
	}

	return bookmarkJSON{
		ID:          bm.ID.Value(),
		URL:         bm.URL.Value(),
		Title:       bm.Title.Value(),
		Description: bm.Description.Value(),
		Tags:        tags,
		CreatedAt:   bm.CreatedAt,
		UpdatedAt:   bm.UpdatedAt,
	}
}

func fromDTO(dto bookmarkJSON) (bookmark.Bookmark, error) {
	id, err := bookmark.NewBookmarkID(dto.ID)
	if err != nil {
		return bookmark.Bookmark{}, fmt.Errorf("invalid ID: %w", err)
	}

	url, err := bookmark.NewBookmarkURL(dto.URL)
	if err != nil {
		return bookmark.Bookmark{}, fmt.Errorf("invalid URL: %w", err)
	}

	title, err := bookmark.NewBookmarkTitle(dto.Title)
	if err != nil {
		return bookmark.Bookmark{}, fmt.Errorf("invalid title: %w", err)
	}

	description := bookmark.NewBookmarkDescription(dto.Description)

	tags := make([]bookmark.BookmarkTag, 0, len(dto.Tags))
	for _, tagStr := range dto.Tags {
		tag, err := bookmark.NewBookmarkTag(tagStr)
		if err != nil {
			return bookmark.Bookmark{}, fmt.Errorf("invalid tag %q: %w", tagStr, err)
		}
		tags = append(tags, tag)
	}

	return bookmark.NewBookmark(id, url, title, description, tags, dto.CreatedAt, dto.UpdatedAt), nil
}
