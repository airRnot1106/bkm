package bookmark

import (
	"errors"
	"net/url"
	"strings"
	"time"

	"github.com/google/uuid"
)

type BookmarkID struct {
	value string
}

func (i BookmarkID) Value() string {
	return i.value
}

func NewBookmarkID(id string) (BookmarkID, error) {
	if _, err := uuid.Parse(id); err != nil {
		return BookmarkID{}, errors.New("invalid UUID format")
	}
	return BookmarkID{value: id}, nil
}

func GenerateBookmarkID() BookmarkID {
	return BookmarkID{value: uuid.New().String()}
}

type BookmarkURL struct {
	value string
}

func (u BookmarkURL) Value() string {
	return u.value
}

func NewBookmarkURL(rawURL string) (BookmarkURL, error) {
	if rawURL == "" {
		return BookmarkURL{}, errors.New("URL cannot be empty")
	}
	parsed, err := url.ParseRequestURI(rawURL)

	if err != nil || parsed.Scheme == "" || parsed.Host == "" {
		return BookmarkURL{}, errors.New("invalid URL format")
	}

	return BookmarkURL{value: rawURL}, nil
}

type BookmarkTitle struct {
	value string
}

func (t BookmarkTitle) Value() string {
	return t.value
}

func NewBookmarkTitle(title string) (BookmarkTitle, error) {
	trimmed := strings.TrimSpace(title)

	if trimmed == "" {
		return BookmarkTitle{}, errors.New("title cannot be empty")
	}

	return BookmarkTitle{value: trimmed}, nil
}

type BookmarkDescription struct {
	value string
}

func (d BookmarkDescription) Value() string {
	return d.value
}

func NewBookmarkDescription(description string) BookmarkDescription {
	trimmed := strings.TrimSpace(description)

	return BookmarkDescription{value: trimmed}
}

type BookmarkTag struct {
	value string
}

func (t BookmarkTag) Value() string {
	return t.value
}

func NewBookmarkTag(tag string) (BookmarkTag, error) {
	trimmed := strings.TrimSpace(tag)

	if trimmed == "" {
		return BookmarkTag{}, errors.New("tag cannot be empty")
	}

	return BookmarkTag{value: trimmed}, nil
}

type Bookmark struct {
	ID          BookmarkID
	URL         BookmarkURL
	Title       BookmarkTitle
	Description BookmarkDescription
	Tags        []BookmarkTag
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func NewBookmark(id BookmarkID, url BookmarkURL, title BookmarkTitle, description BookmarkDescription, tags []BookmarkTag, createdAt time.Time, updatedAt time.Time) Bookmark {
	return Bookmark{
		ID:          id,
		URL:         url,
		Title:       title,
		Description: description,
		Tags:        tags,
		CreatedAt:   createdAt,
		UpdatedAt:   updatedAt,
	}
}

func CreateBookmark(url BookmarkURL, title BookmarkTitle, description BookmarkDescription, tags []BookmarkTag) Bookmark {
	id := GenerateBookmarkID()
	now := time.Now()
	return NewBookmark(id, url, title, description, tags, now, now)
}
