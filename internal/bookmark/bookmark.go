package bookmark

import (
	"errors"
	"net/url"
	"strings"

	"github.com/google/uuid"
)

type BookmarkID struct {
	value string
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

func (i BookmarkID) Value() string {
	return i.value
}

type BookmarkURL struct {
	value string
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

func (u BookmarkURL) Value() string {
	return u.value
}

type BookmarkTitle struct {
	value string
}

func NewBookmarkTitle(title string) (BookmarkTitle, error) {
	trimmed := strings.TrimSpace(title)

	if trimmed == "" {
		return BookmarkTitle{}, errors.New("title cannot be empty")
	}

	return BookmarkTitle{value: trimmed}, nil
}

func (t BookmarkTitle) Value() string {
	return t.value
}

type BookmarkDescription struct {
	value string
}

func NewBookmarkDescription(description string) BookmarkDescription {
	trimmed := strings.TrimSpace(description)

	return BookmarkDescription{value: trimmed}
}

func (d BookmarkDescription) Value() string {
	return d.value
}

type BookmarkTag struct {
	value string
}

func NewBookmarkTag(tag string) (BookmarkTag, error) {
	trimmed := strings.TrimSpace(tag)

	if trimmed == "" {
		return BookmarkTag{}, errors.New("tag cannot be empty")
	}

	return BookmarkTag{value: trimmed}, nil
}

func (t BookmarkTag) Value() string {
	return t.value
}
